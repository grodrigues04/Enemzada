import mongoose from 'mongoose';
import desafioSchema from '../esquemas/desafio.schema.js';

const Desafio = mongoose.models.Desafio || mongoose.model('Desafio', desafioSchema);

class DesafioModel {
	static criar(dados) {
		return Desafio.create(dados);
	}

	static buscarPorData(idUser, date) {
		return Desafio.findOne({ id_user: idUser, date }).lean();
	}

	static buscarUltimoAntesDe(idUser, data) {
		return Desafio.findOne({ id_user: idUser, date: { $lt: data } }).sort({ date: -1 }).lean();
	}

	static buscarQuestoesUsadas(idUser) {
		return Desafio.aggregate([
			{ $match: { id_user: idUser } },
			{ $unwind: '$questions' },
			{ $project: { _id: 0, year: '$questions.year', questionNumber: '$questions.questionNumber' } }
		]);
	}
}

export default DesafioModel;