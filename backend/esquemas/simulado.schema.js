import mongoose from 'mongoose';

const simuladoSchema = new mongoose.Schema(
	{
		id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		year: { type: Number, required: true },
		day: { type: Number, enum: [1, 2], required: true },
		questions: [
			{
				questionNumber: { type: Number, required: true },
				index: { type: Number, required: true },
				subject: { type: String, required: true },
				url: { type: String, required: true },
				answer: { type: String, default: null },
				correctAnswer: { type: String, required: true },
				result: { type: Boolean, default: null }
			}
		],
		startedAt: { type: Date, required: true },
		completedAt: { type: Date, default: null },
		elapsedTime: { type: Number, default: null }
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'simulado'
	}
);

// histórico do usuário: simulados concluídos mais recentes primeiro
simuladoSchema.index({ id_user: 1, completedAt: -1 });

export default simuladoSchema;