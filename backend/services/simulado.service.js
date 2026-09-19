import mongoose from 'mongoose';
import SimuladoModel from '../models/simulado.model.js';

class ServicoErro extends Error {
	constructor(mensagem, status = 400, campos = null) {
		super(mensagem);
		this.status = status;
		this.campos = campos;
	}
}

const urlEnem = 'https://api.enem.dev/v1/exams';
const LIMITE_POR_PAGINA = 50;
const TEMPO_MAXIMO_SEGUNDOS = 6 * 60 * 60;
const LIMITE_QUESTOES_DIA = 90;

const NOME_DISCIPLINA = {
	linguagens: 'Linguagens, Códigos e suas Tecnologias',
	'ciencias-humanas': 'Ciências Humanas e suas Tecnologias',
	'ciencias-natureza': 'Ciências da Natureza e suas Tecnologias',
	matematica: 'Matemática e suas Tecnologias'
};

const DISCIPLINAS_POR_DIA = {
	1: ['linguagens', 'ciencias-humanas'],
	2: ['ciencias-natureza', 'matematica']
};

function ehObjectIdValido(valor) {
	return mongoose.isValidObjectId(valor);
}

function validarAno(valor) {
	const ano = Number(valor);
	if (!Number.isInteger(ano) || ano < 2009 || ano > 2100) {
		throw new ServicoErro('Ano do ENEM inválido.', 400, { year: 'Selecione uma prova válida.' });
	}
	return ano;
}

function validarDia(valor) {
	const dia = Number(valor);
	if (dia !== 1 && dia !== 2) {
		throw new ServicoErro('Dia de prova inválido.', 400, { day: 'Selecione o dia 1 ou 2.' });
	}
	return dia;
}

function validarRespostas(dados) {
	if (!Array.isArray(dados)) {
		throw new ServicoErro('Respostas inválidas.', 400, { answers: 'Envie a lista de respostas.' });
	}

	const respostas = new Map();
	for (const item of dados) {
		const numero = Number(item?.questionNumber);
		if (!Number.isInteger(numero) || numero < 1) {
			throw new ServicoErro('Respostas inválidas.', 400, { answers: 'Questão inválida nas respostas.' });
		}
		const letra = item?.answer == null ? null : String(item.answer).toUpperCase();
		if (letra != null && !/^[A-E]$/.test(letra)) {
			throw new ServicoErro('Respostas inválidas.', 400, { answers: 'Alternativa inválida nas respostas.' });
		}
		respostas.set(numero, letra);
	}

	return [...respostas.entries()].map(([questionNumber, answer]) => ({ questionNumber, answer }));
}

async function buscarQuestoesDaProva(ano) {
	const todas = [];
	for (let offset = 0; offset < 400; offset += LIMITE_POR_PAGINA) {
		const resposta = await fetch(`${urlEnem}/${ano}/questions?limit=${LIMITE_POR_PAGINA}&offset=${offset}`);
		if (!resposta.ok) {
			if (resposta.status === 404) {
				throw new ServicoErro('Prova do ENEM não encontrada.', 404, { year: 'Prova não disponível.' });
			}
			throw new ServicoErro('Não foi possível consultar as questões do ENEM.', 502);
		}
		const dados = await resposta.json();
		const questoes = dados?.questions ?? [];
		if (questoes.length === 0) break;
		todas.push(...questoes);
		if (!dados.metadata?.hasMore) break;
	}
	return todas;
}

function dividirProva(todas) {
	const unicas = new Map();
	for (const questao of todas) {
		if (!questao.correctAlternative) continue;
		if (unicas.has(questao.index)) continue;
		unicas.set(questao.index, questao);
	}
	const questaoUnica = [...unicas.values()];
	const ordemDia1 = ['linguagens', 'ciencias-humanas'];
	const ordemDia2 = ['ciencias-natureza', 'matematica'];

	function sortearPorDisciplina(disciplinas, pool) {
		const selecionadas = [];
		for (const disciplina of disciplinas) {
			selecionadas.push(
				...pool
					.filter((q) => q.discipline === disciplina)
					.sort((a, b) => a.index - b.index)
			);
		}
		return selecionadas;
	}

	function completarDia(principais, pool) {
		const escolhidas = [...principais];
		const usadas = new Set(escolhidas.map((q) => q.index));
		if (escolhidas.length < LIMITE_QUESTOES_DIA) {
			const restantes = pool
				.filter((q) => !usadas.has(q.index))
				.sort((a, b) => a.index - b.index);
			escolhidas.push(...restantes);
		}
		return escolhidas.slice(0, LIMITE_QUESTOES_DIA);
	}

	const principaisDia1 = sortearPorDisciplina(ordemDia1, questaoUnica);
	const dia1 = completarDia(principaisDia1, questaoUnica);
	const usadasDia1 = new Set(dia1.map((q) => q.index));
	const restante = questaoUnica.filter((q) => !usadasDia1.has(q.index));

	const principaisDia2 = sortearPorDisciplina(ordemDia2, restante);
	const dia2 = completarDia(principaisDia2, restante);

	return { dia1, dia2 };
}

function resumo(tentativa) {
	const questoes = tentativa.questions;
	const total = questoes.length;
	const corretas = questoes.filter((q) => q.result === true).length;
	const incorretas = questoes.filter((q) => q.result === false).length;
	const semResposta = questoes.filter((q) => q.result == null).length;
	const acuracia = total === 0 ? 0 : Math.round((corretas / total) * 1000) / 10;

	return {
		id: String(tentativa._id),
		year: tentativa.year,
		day: tentativa.day,
		total,
		corretas,
		incorretas,
		semResposta,
		acuracia,
		elapsedTime: tentativa.elapsedTime,
		completedAt: tentativa.completedAt ?? null
	};
}

class SimuladoService {
	static async iniciar(idUser, dados = {}) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const ano = validarAno(dados.year);
		const dia = validarDia(dados.day);
		const todas = await buscarQuestoesDaProva(ano);

		const { dia1, dia2 } = dividirProva(todas);
		const selecionadas = dia === 1 ? dia1 : dia2;
		const numeroInicial = dia === 1 ? 1 : dia1.length + 1;

		if (selecionadas.length === 0) {
			throw new ServicoErro('Não há questões disponíveis para o dia selecionado.', 404);
		}

		const questoes = selecionadas.map((questao, posicao) => ({
			questionNumber: numeroInicial + posicao,
			index: questao.index,
			subject: NOME_DISCIPLINA[questao.discipline] ?? questao.discipline,
			url: `${urlEnem}/${ano}/questions/${questao.index}`,
			answer: null,
			correctAnswer: questao.correctAlternative,
			result: null
		}));

		const tentativa = await SimuladoModel.criar({
			id_user: idUser,
			year: ano,
			day: dia,
			questions: questoes,
			startedAt: new Date()
		});

		return {
			id: String(tentativa._id),
			year: ano,
			day: dia,
			startedAt: tentativa.startedAt,
			questions: questoes.map((questao) => ({
				questionNumber: questao.questionNumber,
				index: questao.index,
				subject: questao.subject,
				url: questao.url
			}))
		};
	}

	static async detalhar(idUser, idSimulado) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}
		if (!ehObjectIdValido(idSimulado)) {
			throw new ServicoErro('Simulado não encontrado.', 404, { id: 'Simulado não encontrado.' });
		}

		const tentativa = await SimuladoModel.encontrarPorId(idSimulado);
		if (!tentativa || String(tentativa.id_user) !== String(idUser)) {
			throw new ServicoErro('Simulado não encontrado.', 404, { id: 'Simulado não encontrado.' });
		}

		const concluido = Boolean(tentativa.completedAt);
		const base = {
			id: String(tentativa._id),
			year: tentativa.year,
			day: tentativa.day,
			startedAt: tentativa.startedAt,
			completedAt: tentativa.completedAt ?? null,
			elapsedTime: tentativa.elapsedTime ?? null,
			concluido
		};

		if (!concluido) {
			return {
				...base,
				questions: tentativa.questions.map((questao) => ({
					questionNumber: questao.questionNumber,
					index: questao.index,
					subject: questao.subject,
					url: questao.url
				}))
			};
		}

		const thisAttempt = {
			...tentativa,
			questions: tentativa.questions.map((questao) => ({
				questionNumber: questao.questionNumber,
				index: questao.index,
				subject: questao.subject,
				url: questao.url,
				answer: questao.answer,
				correctAnswer: questao.correctAnswer,
				result: questao.result
			}))
		};

		return { ...base, ...resumo(thisAttempt), questions: thisAttempt.questions };
	}

	static async finalizar(idUser, idSimulado, dados = {}) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}
		if (!ehObjectIdValido(idSimulado)) {
			throw new ServicoErro('Simulado não encontrado.', 404, { id: 'Simulado não encontrado.' });
		}

		const tentativa = await SimuladoModel.encontrarPorId(idSimulado);
		if (!tentativa || String(tentativa.id_user) !== String(idUser)) {
			throw new ServicoErro('Simulado não encontrado.', 404, { id: 'Simulado não encontrado.' });
		}
		if (tentativa.completedAt) {
			throw new ServicoErro('Este simulado já foi concluído.', 409);
		}

		const respostas = validarRespostas(dados.answers);
		const mapa = new Map(respostas.map((resposta) => [resposta.questionNumber, resposta.answer]));

		const questoes = tentativa.questions.map((questao) => {
			const selecionada = mapa.get(questao.questionNumber) ?? null;
			const resultado = selecionada == null ? null : selecionada === questao.correctAnswer;
			return { ...questao, answer: selecionada, result: resultado };
		});

		const agora = Date.now();
		const inicioMs = new Date(tentativa.startedAt).getTime();
		const elapsedTime = Math.min(
			TEMPO_MAXIMO_SEGUNDOS,
			Math.max(0, Math.round((agora - inicioMs) / 1000))
		);

		await SimuladoModel.atualizarFinal(tentativa._id, {
			questions: questoes,
			completedAt: new Date(),
			elapsedTime
		});

		return resumo({ ...tentativa, questions: questoes });
	}

	static async historico(idUser) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}
		const tentativas = await SimuladoModel.listarConcluidos(idUser);
		return tentativas.map((tentativa) => resumo(tentativa));
	}
}

export default SimuladoService;