import mongoose from 'mongoose';
import questionSchema from '../esquemas/question.schema.js';

const Question = mongoose.model('Question', questionSchema);

class QuestionModel {
	static encontrarPorQuestao(idUser, question) {
		return Question.findOne({ id_user: idUser, question }).lean();
	}

	static criar(dados) {
		return Question.create(dados);
	}

	static adicionarTentativa(id, tentativa) {
		return Question.findByIdAndUpdate(
			id,
			{ $set: { tentativa: tentativa } },
			{ new: true, runValidators: true }
		).lean();
	}

	static contarPorDia(idUser, inicio, timezone) {
		return Question.aggregate([
			{ $match: { id_user: new mongoose.Types.ObjectId(idUser), 'tentativa.data': { $gte: inicio } } },
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$tentativa.data', timezone } },
					questoes: { $sum: 1 }
				}
			}
		]);
	}
}

export default QuestionModel;