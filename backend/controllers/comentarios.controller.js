import ComentariosService from '../services/comentarios.service.js';

export async function listar(req, res) {
	try {
		const comentarios = await ComentariosService.listarPorQuestao(req.params.idQuestao);
		res.status(200).json(comentarios);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao listar comentários.',
			campos: erro.campos
		});
	}
}

export async function listarDaResolucao(req, res) {
	try {
		const comentarios = await ComentariosService.listarPorResolucao(req.params.id);
		res.status(200).json(comentarios);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao listar comentários.',
			campos: erro.campos
		});
	}
}

export async function criar(req, res) {
	try {
		const comentario = await ComentariosService.criar(req.usuario.id, req.body);
		res.status(201).json(comentario);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao publicar comentário.',
			campos: erro.campos
		});
	}
}

export async function comentarNaResolucao(req, res) {
	try {
		const comentario = await ComentariosService.comentarNaResolucao(
			req.usuario.id,
			req.params.id,
			req.body
		);
		res.status(201).json(comentario);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao publicar comentário.',
			campos: erro.campos
		});
	}
}

export async function responderComentario(req, res) {
	try {
		const comentario = await ComentariosService.responder(
			req.usuario.id,
			req.params.id,
			req.body
		);
		res.status(201).json(comentario);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao responder comentário.',
			campos: erro.campos
		});
	}
}