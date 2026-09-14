import mongoose from 'mongoose';
import questionSchema from '../esquemas/question.schema.js';

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

class RankingModel {
	static async contarPorPeriodo(inicio, fim) {
		return Question.aggregate([
			{ $match: { 'tentativa.data': { $gte: inicio, $lte: fim }, 'tentativa.resultado': true } },
			{ $group: { _id: '$id_user', totalQuestoes: { $sum: 1 } } },
			{ $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'usuario' } },
			{ $unwind: '$usuario' },
			{ $project: { _id: 1, nome: '$usuario.nomeCompleto', totalQuestoes: 1 } },
			{ $sort: { totalQuestoes: -1 } },
			{ $limit: 10 }
		]);
	}
}

export default RankingModel;