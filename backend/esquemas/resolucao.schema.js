import mongoose from 'mongoose';

const resolucaoSchema = new mongoose.Schema(
	{
		id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		id_questao: { type: String, required: true, trim: true, match: /^\d{4}-\d+$/ },
		conteudo: { type: String, required: true, trim: true },
		votos: { type: Number, default: 0 },
		data: { type: Date, default: () => new Date() }
	},
	{
		versionKey: false,
		collection: 'resolucao'
	}
);

resolucaoSchema.index({ id_questao: 1, data: -1 });
resolucaoSchema.index({ id_user: 1, data: -1 });

export default resolucaoSchema;