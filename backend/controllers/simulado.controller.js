import SimuladoService from '../services/simulado.service.js';

export async function historico(req, res) {
	try {
		const dados = await SimuladoService.historico(req.usuario.id);
		res.status(200).json(dados);
	} catch (erro) {
		console.error('Ocorreu um erro', erro);
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao listar simulados.',
			campos: erro.campos
		});
	}
}

export async function iniciar(req, res) {
	try {
		const dados = await SimuladoService.iniciar(req.usuario.id, req.body);
		res.status(201).json(dados);
	} catch (erro) {
		console.error('Ocorreu um erro', erro);
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao iniciar o simulado.',
			campos: erro.campos
		});
	}
}

export async function detalhar(req, res) {
	try {
		const dados = await SimuladoService.detalhar(req.usuario.id, req.params.id);
		res.status(200).json(dados);
	} catch (erro) {
		console.error('Ocorreu um erro', erro);
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao carregar o simulado.',
			campos: erro.campos
		});
	}
}

export async function finalizar(req, res) {
	try {
		const dados = await SimuladoService.finalizar(req.usuario.id, req.params.id, req.body);
		res.status(200).json(dados);
	} catch (erro) {
		console.error('Ocorreu um erro', erro);
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao concluir o simulado.',
			campos: erro.campos
		});
	}
}