import UserService from '../services/user.service.js';

// O controller apenas recebe a requisição e repassa a responsabilidade ao serviço.
export async function cadastrar(req, res) {
	try {
		const usuario = await UserService.cadastrar(req.body);
		res.status(201).json(usuario);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao cadastrar usuário.',
			campos: erro.campos
		});
	}
}

export async function login(req, res) {
	try {
		const usuario = await UserService.login(req.query.email, req.query.senha);
		res.status(200).json(usuario);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao autenticar usuário.',
			campos: erro.campos
		});
	}
}