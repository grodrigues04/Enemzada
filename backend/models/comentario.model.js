import mongoose from 'mongoose';
import comentarioSchema from '../esquemas/comentario.schema.js';

const Comentario = mongoose.models.Comentario || mongoose.model('Comentario', comentarioSchema);

class ComentarioModel {
	static criar(dados) {
		return Comentario.create(dados);
	}

	static encontrarPorId(id) {
		return Comentario.findById(id).lean();
	}

	static listarPorQuestao(idQuestao) {
		return Comentario.aggregate([
			{ $match: { id_questao: idQuestao, id_resolucao: null } },
			{ $lookup: { from: 'users', localField: 'id_user', foreignField: '_id', as: 'autorInfo' } },
			{ $unwind: { path: '$autorInfo', preserveNullAndEmptyArrays: true } },
			{
				$project: {
					_id: 1,
					id_resolucao: 1,
					id_comentario_pai: 1,
					conteudo: 1,
					data: 1,
					autor: '$autorInfo.nomeCompleto'
				}
			},
			{ $sort: { data: -1 } }
		]);
	}

	static listarPorResolucao(idResolucao) {
		return Comentario.aggregate([
			{ $match: { id_resolucao: idResolucao } },
			{ $lookup: { from: 'users', localField: 'id_user', foreignField: '_id', as: 'autorInfo' } },
			{ $unwind: { path: '$autorInfo', preserveNullAndEmptyArrays: true } },
			{
				$project: {
					_id: 1,
					conteudo: 1,
					data: 1,
					autor: '$autorInfo.nomeCompleto'
				}
			},
			{ $sort: { data: 1 } }
		]);
	}

	static contarPorResolucoes(ids) {
		return Comentario.aggregate([
			{ $match: { id_resolucao: { $in: ids } } },
			{ $group: { _id: '$id_resolucao', total: { $sum: 1 } } }
		]);
	}
}

export default ComentarioModel;