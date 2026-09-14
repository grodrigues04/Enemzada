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
}

export default QuestionModel;