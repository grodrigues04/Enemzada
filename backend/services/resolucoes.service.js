import UserModel from '../models/user.model.js';
import ResolucaoModel from '../models/resolucao.model.js';
import ComentarioModel from '../models/comentario.model.js';

class ServicoErro extends Error {
	constructor(mensagem, status = 400, campos = null) {
		super(mensagem);
		this.status = status;
		this.campos = campos;
	}
}

const LIMITE_CONTEUDO = 5000;

function validarResolucao(dados = {}) {
	const idQuestao = String(dados.id_questao ?? '').trim();
	const conteudo = String(dados.conteudo ?? '').trim();
	const erroCampos = {};

	if (!idQuestao) erroCampos.id_questao = 'Informe a questão.';
	else if (!/^\d{4}-\d+$/.test(idQuestao)) erroCampos.id_questao = 'Questão inválida.';

	if (!conteudo) erroCampos.conteudo = 'Escreva uma resolução.';
	else if (conteudo.length > LIMITE_CONTEUDO) {
		erroCampos.conteudo = `A resolução deve ter no máximo ${LIMITE_CONTEUDO} caracteres.`;
	}

	if (Object.keys(erroCampos).length > 0) {
		throw new ServicoErro('Verifique os dados da resolução.', 400, erroCampos);
	}

	return { idQuestao, conteudo };
}

class ResolucoesService {
	static async listarPorQuestao(idQuestao) {
		const id = String(idQuestao ?? '').trim();
		if (!/^\d{4}-\d+$/.test(id)) {
			throw new ServicoErro('Questão inválida.', 400, { id_questao: 'Questão inválida.' });
		}

		const resolucoes = await ResolucaoModel.listarPorQuestao(id);
		if (resolucoes.length === 0) return [];

		const contagens = await ComentarioModel.contarPorResolucoes(resolucoes.map((r) => r._id));
		const totalPorResolucao = new Map(contagens.map((contagem) => [String(contagem._id), contagem.total]));

		return resolucoes.map((resolucao) => ({
			id: String(resolucao._id),
			autor: resolucao.autor ?? 'Usuário',
			votos: resolucao.votos ?? 0,
			texto: resolucao.conteudo,
			totalComentarios: totalPorResolucao.get(String(resolucao._id)) ?? 0,
			data: resolucao.data
		}));
	}

	static async criar(idUser, dados = {}) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const { idQuestao, conteudo } = validarResolucao(dados);
		const usuario = await UserModel.encontrarPorId(idUser);
		const resolucao = await ResolucaoModel.criar({ id_user: idUser, id_questao: idQuestao, conteudo });

		return {
			id: String(resolucao._id),
			autor: usuario?.nomeCompleto ?? 'Usuário',
			votos: 0,
			texto: resolucao.conteudo,
			totalComentarios: 0,
			data: resolucao.data
		};
	}
}

export default ResolucoesService;