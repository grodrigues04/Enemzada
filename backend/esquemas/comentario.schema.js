import mongoose from 'mongoose';

const comentarioSchema = new mongoose.Schema(
	{
		id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		id_questao: { type: String, required: true, trim: true, match: /^\d{4}-\d+$/ },
		id_resolucao: { type: mongoose.Schema.Types.ObjectId, ref: 'Resolucao', default: null },
		id_comentario_pai: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario', default: null },
		conteudo: { type: String, required: true, trim: true },
		data: { type: Date, default: () => new Date() }
	},
	{
		versionKey: false,
		collection: 'comentario'
	}
);

comentarioSchema.index({ id_questao: 1, data: -1 });
comentarioSchema.index({ id_comentario_pai: 1, data: 1 });
comentarioSchema.index({ id_resolucao: 1, data: 1 });

export default comentarioSchema;
