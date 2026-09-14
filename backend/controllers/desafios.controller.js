import DesafiosService from '../services/desafios.service.js';

// O controller apenas recebe a requisição e repassa a responsabilidade ao serviço.
export async function contexto(req, res) {
	try {
		const dados = await DesafiosService.contexto(req.usuario.id);
		res.status(200).json(dados);
	} catch (erro) {
		console.error('Ocorreu um erro', erro);
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao buscar o desafio diário.',
			campos: erro.campos
		});
	}
}

export async function comecar(req, res) {
	try {
		const dados = await DesafiosService.selecionarQuestoes(req.usuario.id);
		res.status(200).json(dados);
	} catch (erro) {
		console.error('Ocorreu um erro', erro);
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao iniciar o desafio diário.',
			campos: erro.campos
		});
	}
}

export async function concluir(req, res) {
	try {
		const dados = await DesafiosService.concluir(req.usuario.id, req.body);
		res.status(201).json(dados);
	} catch (erro) {
		console.error('Ocorreu um erro', erro);
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao concluir o desafio diário.',
			campos: erro.campos
		});
	}
}