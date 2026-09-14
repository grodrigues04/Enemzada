import QuestionModel from '../models/question.model.js';

class ServicoErro extends Error {
	constructor(mensagem, status = 400, campos = null) {
		super(mensagem);
		this.status = status;
		this.campos = campos;
	}
}

class QuestionsService {
	static async ranking() {
		console.log('oi');
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