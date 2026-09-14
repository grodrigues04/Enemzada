import QuestionModel from '../models/question.model.js';

class ServicoErro extends Error {
	constructor(mensagem, status = 400, campos = null) {
		super(mensagem);
		this.status = status;
		this.campos = campos;
	}
}

const FUSO = process.env.FUSO_DESAFIO ?? 'America/Sao_Paulo';
const DIAS_DESEMPENHO = 7;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

function inicioDoDia(deslocamento = 0) {
	const agora = new Date(Date.now() + deslocamento * MS_POR_DIA);
	const partes = new Intl.DateTimeFormat('en-CA', {
		timeZone: FUSO,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(agora);
	const ano = Number(partes.find((p) => p.type === 'year').value);
	const mes = Number(partes.find((p) => p.type === 'month').value);
	const dia = Number(partes.find((p) => p.type === 'day').value);
	return new Date(Date.UTC(ano, mes - 1, dia));
}

class QuestionsService {
	static async ranking() {
		console.log('oi');
	}

	static async desempenhoSemanal(idUser) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const inicio = inicioDoDia(-(DIAS_DESEMPENHO - 1));
		const contagens = await QuestionModel.contarPorDia(idUser, inicio, FUSO);
		const porDia = new Map(contagens.map((c) => [c._id, c.questoes]));

		const dias = [];
		for (let i = DIAS_DESEMPENHO - 1; i >= 0; i -= 1) {
			const data = inicioDoDia(-i).toISOString().slice(0, 10);
			dias.push({ data, questoes: porDia.get(data) ?? 0 });
		}

		return { dias };
	}

	static async logarTentativa(dados = {}) {
		const idUser = dados.id_user;
		const question = dados.question ?? {};

		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const numero = Number(question.numero);
		const ano = Number(question.ano);
		const url = question.url?.trim();

		if (!numero || Number.isNaN(numero)) {
			throw new ServicoErro('Verifique os dados da questão.', 400, { numero: 'O número da questão é obrigatório.' });
		}
		if (!ano || Number.isNaN(ano)) {
			throw new ServicoErro('Verifique os dados da questão.', 400, { ano: 'O ano da questão é obrigatório.' });
		}

		if (!url) {
			throw new ServicoErro('Verifique os dados da questão.', 400, { url: 'A URL da questão é obrigatória.' });
		}

		if (typeof dados.resultado !== 'boolean') {
			throw new ServicoErro('Verifique os dados da tentativa.', 400, { resultado: 'O resultado da tentativa é obrigatório.' });
		}

		const tentativa = {
			data: new Date(),
			resultado: dados.resultado
		};

		const questao = { numero, ano };
		const registroExistente = await QuestionModel.encontrarPorQuestao(idUser, questao);

		if (registroExistente) {
			return QuestionModel.adicionarTentativa(registroExistente._id, tentativa);
		}

		return QuestionModel.criar({
			id_user: idUser,
			question: { numero, ano, url },
			tentativa
		});
	}
}

export default QuestionsService;