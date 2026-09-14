import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		nomeCompleto: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		cpf: { type: String, required: true, unique: true, trim: true },
		dataNascimento: { type: Date, required: true },
		senha: { type: String, required: true, select: false },
		streak_diaria: { type: Number, default: 0 }
	},
	{
		timestamps: true,
		versionKey: false
	}
);

userSchema.set('toJSON', {
	transform(doc, ret) {
		delete ret.senha;
		return ret;
	}
});

export default userSchema;