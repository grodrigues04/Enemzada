import mongoose from 'mongoose';
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

const LIMITE_CONTEUDO = 2000;

function validarIdQuestao(idQuestao, erroCampos) {
	if (!idQuestao) erroCampos.id_questao = 'Informe a questão.';
	else if (!/^\d{4}-\d+$/.test(idQuestao)) erroCampos.id_questao = 'Questão inválida.';
}

function validarConteudo(conteudo, erroCampos) {
	if (!conteudo) erroCampos.conteudo = 'Escreva um comentário.';
	else if (conteudo.length > LIMITE_CONTEUDO) {
		erroCampos.conteudo = `O comentário deve ter no máximo ${LIMITE_CONTEUDO} caracteres.`;
	}
}

function serializarComentario(comentario, autor) {
	return {
		id: String(comentario._id),
		autor,
		texto: comentario.conteudo,
		data: comentario.data
	};
}

function ehObjectIdValido(valor) {
	return mongoose.isValidObjectId(valor);
}

async function nomeDoAutor(idUser) {
	const usuario = await UserModel.encontrarPorId(idUser);
	return usuario?.nomeCompleto ?? 'Usuário';
}

class ComentariosService {
	static async listarPorQuestao(idQuestao) {
		const id = String(idQuestao ?? '').trim();
		if (!/^\d{4}-\d+$/.test(id)) {
			throw new ServicoErro('Questão inválida.', 400, { id_questao: 'Questão inválida.' });
		}

		const todos = await ComentarioModel.listarPorQuestao(id);
		const raizes = [];
		const respostasPorPai = new Map();

		for (const comentario of todos) {
			const limpo = {
				id: String(comentario._id),
				autor: comentario.autor ?? 'Usuário',
				texto: comentario.conteudo,
				data: comentario.data
			};

			if (comentario.id_comentario_pai) {
				const chave = String(comentario.id_comentario_pai);
				if (!respostasPorPai.has(chave)) respostasPorPai.set(chave, []);
				respostasPorPai.get(chave).push(limpo);
			} else {
				raizes.push(limpo);
			}
		}

		return raizes.map((raiz) => {
			const respostas = respostasPorPai.get(raiz.id) ?? [];
			respostas.sort((a, b) => new Date(a.data) - new Date(b.data));
			return { ...raiz, respostas };
		});
	}

	static async listarPorResolucao(idResolucao) {
		if (!ehObjectIdValido(idResolucao)) {
			throw new ServicoErro('Resolução não encontrada.', 404, {
				id_resolucao: 'Resolução não encontrada.'
			});
		}

		const resolucao = await ResolucaoModel.encontrarPorId(idResolucao);
		if (!resolucao) {
			throw new ServicoErro('Resolução não encontrada.', 404, {
				id_resolucao: 'Resolução não encontrada.'
			});
		}

		const comentarios = await ComentarioModel.listarPorResolucao(resolucao._id);
		return comentarios.map((comentario) => serializarComentario(comentario, comentario.autor ?? 'Usuário'));
	}

	static async criar(idUser, dados = {}) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const idQuestao = String(dados.id_questao ?? '').trim();
		const conteudo = String(dados.conteudo ?? '').trim();
		const erroCampos = {};
		validarIdQuestao(idQuestao, erroCampos);
		validarConteudo(conteudo, erroCampos);
		if (Object.keys(erroCampos).length > 0) {
			throw new ServicoErro('Verifique os dados do comentário.', 400, erroCampos);
		}

		const comentario = await ComentarioModel.criar({ id_user: idUser, id_questao: idQuestao, conteudo });
		const autor = await nomeDoAutor(idUser);
		return { ...serializarComentario(comentario, autor), respostas: [] };
	}

	static async comentarNaResolucao(idUser, idResolucao, dados = {}) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const conteudo = String(dados.conteudo ?? '').trim();
		const erroCampos = {};
		validarConteudo(conteudo, erroCampos);
		if (Object.keys(erroCampos).length > 0) {
			throw new ServicoErro('Verifique os dados do comentário.', 400, erroCampos);
		}

		const resolucao = await ResolucaoModel.encontrarPorId(idResolucao);
		if (!ehObjectIdValido(idResolucao) || !resolucao) {
			throw new ServicoErro('Resolução não encontrada.', 404, {
				id_resolucao: 'Resolução não encontrada.'
			});
		}

		const comentario = await ComentarioModel.criar({
			id_user: idUser,
			id_questao: resolucao.id_questao,
			id_resolucao: resolucao._id,
			conteudo
		});
		const autor = await nomeDoAutor(idUser);
		return { ...serializarComentario(comentario, autor), id_resolucao: String(resolucao._id) };
	}

	static async responder(idUser, idComentarioPai, dados = {}) {
		if (!idUser) {
			throw new ServicoErro('Usuário não identificado.', 401);
		}

		const conteudo = String(dados.conteudo ?? '').trim();
		const erroCampos = {};
		validarConteudo(conteudo, erroCampos);
		if (Object.keys(erroCampos).length > 0) {
			throw new ServicoErro('Verifique os dados da resposta.', 400, erroCampos);
		}

		const pai = await ComentarioModel.encontrarPorId(idComentarioPai);
		if (!ehObjectIdValido(idComentarioPai) || !pai) {
			throw new ServicoErro('Comentário não encontrado.', 404, {
				id_comentario_pai: 'Comentário não encontrado.'
			});
		}
		if (pai.id_comentario_pai) {
			throw new ServicoErro('Não é possível responder a uma resposta.', 400, {
				id_comentario_pai: 'Só é possível responder comentários do nível principal.'
			});
		}

		const comentario = await ComentarioModel.criar({
			id_user: idUser,
			id_questao: pai.id_questao,
			id_comentario_pai: pai._id,
			conteudo
		});
		const autor = await nomeDoAutor(idUser);
		return { ...serializarComentario(comentario, autor), id_comentario_pai: String(pai._id) };
	}
}

export default ComentariosService;