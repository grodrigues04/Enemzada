import mongoose from 'mongoose';
import resolucaoSchema from '../esquemas/resolucao.schema.js';

const Resolucao = mongoose.models.Resolucao || mongoose.model('Resolucao', resolucaoSchema);

class ResolucaoModel {
	static criar(dados) {
		return Resolucao.create(dados);
	}

	static encontrarPorId(id) {
		return Resolucao.findById(id).lean();
	}

	static listarPorQuestao(idQuestao) {
		return Resolucao.aggregate([
			{ $match: { id_questao: idQuestao } },
			{ $lookup: { from: 'users', localField: 'id_user', foreignField: '_id', as: 'autorInfo' } },
			{ $unwind: { path: '$autorInfo', preserveNullAndEmptyArrays: true } },
			{ $project: { _id: 1, conteudo: 1, votos: 1, data: 1, autor: '$autorInfo.nomeCompleto' } },
			{ $sort: { data: -1 } }
		]);
	}
}

export default ResolucaoModel;