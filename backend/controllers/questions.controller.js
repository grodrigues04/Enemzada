import UserService from '../services/user.service.js';

// O controller apenas recebe a requisição e repassa a responsabilidade ao serviço.
export async function ranking(req, res) {
	try {
		console.log('Chegou');
		res.status(201).json({ ping: 'pong' });
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao cadastrar usuário.',
			campos: erro.campos
		});
	}
}
