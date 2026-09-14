import QuestionsService from '../services/questions.service.js';

// O controller apenas recebe a requisição e repassa a responsabilidade ao serviço.
export async function ranking(req, res) {
	try {
		console.log('rota ranking');
		res.status(201).json({ ping: 'pong' });
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao cadastrar usuário.',
			campos: erro.campos
		});
	}
}

export async function registrarLog(req, res) {
	try {
		const registro = await QuestionsService.logarTentativa({ ...req.body, id_user: req.usuario.id });
		res.status(201).json(registro);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao registrar tentativa.',
			campos: erro.campos
		});
	}
}

export async function desempenhoSemanal(req, res) {
	try {
		const resultado = await QuestionsService.desempenhoSemanal(req.usuario.id);
		res.status(200).json(resultado);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao buscar desempenho semanal.',
			campos: erro.campos
		});
	}
}
