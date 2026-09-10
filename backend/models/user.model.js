import mongoose from 'mongoose';
import userSchema from '../esquemas/user.schema.js';

const User = mongoose.model('User', userSchema);

// Camada de acesso ao banco: apenas consultas, sem regras de negócio.
class UserModel {
	static encontrarPorEmail(email) {
		return User.findOne({ email }).select('+senha').lean();
	}

	static encontrarPorCpf(cpf) {
		return User.findOne({ cpf }).lean();
	}

	static criar(dados) {
		return User.create(dados);
	}
}

export default UserModel;