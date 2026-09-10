import bcrypt from 'bcryptjs';
import UserModel from '../models/user.model.js';

class ServicoErro extends Error {
	constructor(mensagem, status = 400, campos = null) {
		super(mensagem);
		this.status = status;
		this.campos = campos;
	}
}

function cpfValido(cpf) {
	const digitos = String(cpf).replace(/\D/g, '');

	if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
		return false;
	}

	function digitoVerificador(base) {
		let soma = 0;
		for (let i = 0; i < base.length; i += 1) {
			soma += Number(base[i]) * (base.length + 1 - i);
		}
		const resto = (soma * 10) % 11;
		return resto === 10 ? 0 : resto;
	}

	if (digitoVerificador(digitos.slice(0, 9)) !== Number(digitos[9])) return false;
	if (digitoVerificador(digitos.slice(0, 10)) !== Number(digitos[10])) return false;

	return true;
}

class UserService {
	static async cadastrar(dados = {}) {
		const nomeCompleto = dados.nomeCompleto?.trim();
		const email = dados.email?.trim().toLowerCase();
		const cpf = String(dados.cpf ?? '').replace(/\D/g, '');
		const dataNascimento = dados.dataNascimento;
		const senha = dados.senha ?? '';
		const confirmacaoSenha = dados.confirmacaoSenha ?? '';

		const erroCampos = {};

		if (!nomeCompleto) erroCampos.nomeCompleto = 'Informe o nome completo.';
		else if (nomeCompleto.split(' ').filter((p) => p).length < 2) erroCampos.nomeCompleto = 'Informe nome e sobrenome.';

		if (!email) erroCampos.email = 'Informe o e-mail.';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erroCampos.email = 'E-mail inválido.';

		if (!cpf) erroCampos.cpf = 'Informe o CPF.';
		else if (!cpfValido(cpf)) erroCampos.cpf = 'CPF inválido.';

		if (!dataNascimento) erroCampos.dataNascimento = 'Informe a data de nascimento.';
		else if (Number.isNaN(new Date(dataNascimento).getTime())) erroCampos.dataNascimento = 'Data de nascimento inválida.';
		else if (new Date(dataNascimento) >= new Date()) erroCampos.dataNascimento = 'A data de nascimento deve estar no passado.';

		if (!senha) erroCampos.senha = 'Informe a senha.';
		else if (senha.length < 6) erroCampos.senha = 'A senha precisa ter ao menos 6 caracteres.';

		if (!confirmacaoSenha) erroCampos.confirmacaoSenha = 'Confirme a senha.';
		else if (senha !== confirmacaoSenha) erroCampos.confirmacaoSenha = 'As senhas não coincidem.';

		if (Object.keys(erroCampos).length > 0) {
			throw new ServicoErro('Verifique os campos do formulário.', 400, erroCampos);
		}

		const emailCadastrado = await UserModel.encontrarPorEmail(email);
		if (emailCadastrado) {
			throw new ServicoErro('Já existe uma conta com este e-mail.', 409, { email: 'E-mail já cadastrado.' });
		}

		const cpfCadastrado = await UserModel.encontrarPorCpf(cpf);
		if (cpfCadastrado) {
			throw new ServicoErro('Já existe uma conta com este CPF.', 409, { cpf: 'CPF já cadastrado.' });
		}

		const senhaHash = await bcrypt.hash(senha, 10);

		const usuario = await UserModel.criar({
			nomeCompleto,
			email,
			cpf,
			dataNascimento,
			senha: senhaHash
		});

		return usuario.toJSON();
	}

	static async login(emailInformado, senha) {
		const email = emailInformado?.trim().toLowerCase();
		const erroCampos = {};

		if (!email) erroCampos.email = 'Informe o e-mail.';
		if (!senha) erroCampos.senha = 'Informe a senha.';

		if (Object.keys(erroCampos).length > 0) {
			throw new ServicoErro('Informe e-mail e senha.', 400, erroCampos);
		}

		const usuario = await UserModel.encontrarPorEmail(email);

		if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
			throw new ServicoErro('E-mail ou senha inválidos.', 401);
		}

		const { senha: _ignorada, ...dadosPublicos } = usuario;
		return dadosPublicos;
	}
}

export default UserService;