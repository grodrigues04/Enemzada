import ResolucoesService from '../services/resolucoes.service.js';

export async function listar(req, res) {
	try {
		const resolucoes = await ResolucoesService.listarPorQuestao(req.params.idQuestao);
		res.status(200).json(resolucoes);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao listar resoluções.',
			campos: erro.campos
		});
	}
}

export async function criar(req, res) {
	try {
		const resolucao = await ResolucoesService.criar(req.usuario.id, req.body);
		res.status(201).json(resolucao);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao publicar resolução.',
			campos: erro.campos
		});
	}
}