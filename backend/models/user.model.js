import mongoose from 'mongoose';
import userSchema from '../esquemas/user.schema.js';

const User = mongoose.model('User', userSchema);

class UserModel {
	static encontrarPorEmail(email) {
		return User.findOne({ email }).select('+senha').lean();
	}

	static encontrarPorCpf(cpf) {
		return User.findOne({ cpf }).lean();
	}

	static encontrarPorId(id) {
		return User.findById(id).lean();
	}

	static criar(dados) {
		return User.create(dados);
	}
}

export default UserModel;
