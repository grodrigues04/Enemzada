import mongoose from 'mongoose';

const desafioSchema = new mongoose.Schema(
	{
		id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		questions: [
			{
				year: { type: Number, required: true },
				questionNumber: { type: Number, required: true },
				url: { type: String, required: true },
				result: { type: Boolean, required: true }
			}
		],
		date: { type: Date, required: true },
		elapsedTime: { type: Number, required: true }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'desafio'
	}
);

// um desafio por dia por usuário (date é "ancorado" no início do dia do calendário)
desafioSchema.index({ id_user: 1, date: 1 }, { unique: true });

export default desafioSchema;