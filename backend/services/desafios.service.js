import DesafioModel from '../models/desafio.model.js';
import UserModel from '../models/user.model.js';

class ServicoErro extends Error {
	constructor(mensagem, status = 400, campos = null) {
		super(mensagem);
		this.status = status;
		this.campos = campos;
	}
}

const QUANTIDADE_QUESTAOES = 5;
const ANOS = Array.from({ length: 15 }, (_, i) => 2023 - i);
const FUSO_DESAFIO = process.env.FUSO_DESAFIO ?? 'America/Sao_Paulo';
const MS_POR_DIA = 24 * 60 * 60 * 1000;

function inicioDoDia(deslocamento = 0) {
	const agora = new Date(Date.now() + deslocamento * MS_POR_DIA);
	const partes = new Intl.DateTimeFormat('en-CA', {
		timeZone: FUSO_DESAFIO,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(agora);
	const ano = Number(partes.find((p) => p.type === 'year').value);
	const mes = Number(partes.find((p) => p.type === 'month').value);
	const dia = Number(partes.find((p) => p.type === 'day').value);
	return new Date(Date.UTC(ano, mes - 1, dia));
}

function aguardar(ms) {
	return new Promise((resolver) => setTimeout(resolver, ms));
}

async function buscarQuestaoDaEnem(ano, offset) {
	const resposta = await fetch(`https://api.enem.dev/v1/exams/${ano}/questions?limit=1&offset=${offset}`);
	if (!resposta.ok) {
		throw new ServicoErro('Não foi possível consultar as questões do ENEM.', 502);
	}
	return resposta.json();
}

function validarConclusao(dados = {}) {
	const erroCampos = {};

	const questoes = Array.isArray(dados.questions) ? dados.questions : [];

	if (questoes.length !== QUANTIDADE_QUESTAOES) {
		erroCampos.questions = `O desafio deve conter ${QUANTIDADE_QUESTAOES} questões.`;
	}

	questoes.forEach((questao, indice) => {
		const campo = `questions[${indice}]`;
		const ano = Number(questao?.year);
		const numero = Number(questao?.questionNumber);

		if (!ano || Number.isNaN(ano)) erroCampos[`${campo}.year`] = 'O ano da questão é obrigatório.';
		if (!numero || Number.isNaN(numero)) erroCampos[`${campo}.questionNumber`] = 'O número da questão é obrigatório.';
		if (!questao?.url?.trim()) erroCampos[`${campo}.url`] = 'A URL da questão é obrigatória.';
		if (typeof questao?.result !== 'boolean') erroCampos[`${campo}.result`] = 'O resultado da questão é obrigatório.';
	});

	const elapsedTime = Number(dados.elapsedTime);
	if (Number.isNaN(elapsedTime) || elapsedTime < 0) {
		erroCampos.elapsedTime = 'O tempo de conclusão é obrigatório.';
	} else if (elapsedTime > 12 * 60 * 60) {
		erroCampos.elapsedTime = 'O tempo de conclusão excede o limite permitido.';
	}

	if (Object.keys(erroCampos).length > 0) {
		throw new ServicoErro('Verifique os dados do desafio.', 400, erroCampos);
	}

	return {
		questoes: questoes.map((questao) => ({
			year: Number(questao.year),
			questionNumber: Number(questao.questionNumber),
			url: String(questao.url).trim(),
			result: questao.result
		})),
		elapsedTime
	};
}

class DesafiosService {
	static async contexto(idUser) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}
		const hoje = inicioDoDia();
		const desafio = await DesafioModel.buscarPorData(idUser, hoje);
		const usuario = await UserModel.encontrarPorId(idUser);
		return {
			concluidoHoje: Boolean(desafio),
			desafio,
			streak_diaria: usuario?.streak_diaria ?? 0
		};
	}

	static async selecionarQuestoes(idUser) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const hoje = inicioDoDia();
		const jaCompletado = await DesafioModel.buscarPorData(idUser, hoje);
		if (jaCompletado) {
			throw new ServicoErro('Você já completou o desafio diário de hoje.', 409);
		}

		const usadas = new Set(
			(await DesafioModel.buscarQuestoesUsadas(idUser)).map((q) => `${q.year}:${q.questionNumber}`)
		);

		const selecionadas = [];
		const escolhidas = new Set();
		const MAX_TENTATIVAS = 60;

		for (let tentativa = 0; tentativa < MAX_TENTATIVAS && selecionadas.length < QUANTIDADE_QUESTAOES; tentativa += 1) {
			const ano = ANOS[Math.floor(Math.random() * ANOS.length)];
			const offset = Math.floor(Math.random() * 190);

			try {
				const dados = await buscarQuestaoDaEnem(ano, offset);
				const questao = dados?.questions?.[0];
				if (!questao) continue;

				const chave = `${questao.year}:${questao.index}`;
				if (usadas.has(chave) || escolhidas.has(chave)) continue;

				escolhidas.add(chave);
				selecionadas.push({
					year: questao.year,
					questionNumber: questao.index,
					url: `https://api.enem.dev/v1/exams/${questao.year}/questions/${questao.index}`,
					title: questao.title,
					context: questao.context,
					files: questao.files ?? [],
					alternativesIntroduction: questao.alternativesIntroduction,
					alternatives: questao.alternatives ?? [],
					correctAlternative: questao.correctAlternative,
					discipline: questao.discipline,
					language: questao.language
				});
			} catch {
				// ignora tentativas falhas e continua buscando
			}

			await aguardar(350);
		}

		if (selecionadas.length < QUANTIDADE_QUESTAOES) {
			throw new ServicoErro(
				'Não há questões suficientes disponíveis para o desafio de hoje. Tente novamente amanhã.',
				409
			);
		}

		return { questoes: selecionadas };
	}

	static async concluir(idUser, dados = {}) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const { questoes, elapsedTime } = validarConclusao(dados);

		const hoje = inicioDoDia();
		const jaCompletado = await DesafioModel.buscarPorData(idUser, hoje);
		if (jaCompletado) {
			throw new ServicoErro('Você já completou o desafio diário de hoje.', 409);
		}

		const ontem = inicioDoDia(-1);
		const anterior = await DesafioModel.buscarUltimoAntesDe(idUser, hoje);
		const usuario = await UserModel.encontrarPorId(idUser);

		let streakDiaria = 1;
		if (anterior && anterior.date.getTime() === ontem.getTime()) {
			streakDiaria = (usuario?.streak_diaria ?? 0) + 1;
		}

		try {
			const desafio = await DesafioModel.criar({
				id_user: idUser,
				questions: questoes,
				date: hoje,
				elapsedTime
			});
			await UserModel.atualizarStreak(idUser, streakDiaria);
			return { desafio: desafio.toJSON(), streak_diaria: streakDiaria };
		} catch (erro) {
			if (erro.code === 11000) {
				throw new ServicoErro('Você já completou o desafio diário de hoje.', 409);
			}
			throw erro;
		}
	}
}

export default DesafiosService;