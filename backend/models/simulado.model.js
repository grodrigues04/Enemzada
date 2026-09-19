import mongoose from 'mongoose';
import simuladoSchema from '../esquemas/simulado.schema.js';

const Simulado = mongoose.models.Simulado || mongoose.model('Simulado', simuladoSchema);

class SimuladoModel {
	static criar(dados) {
		return Simulado.create(dados);
	}

	static encontrarPorId(id) {
		return Simulado.findById(id).lean();
	}

	static listarConcluidos(idUser) {
		return Simulado.find({ id_user: idUser, completedAt: { $ne: null } })
			.sort({ completedAt: -1 })
			.lean();
	}

	static atualizarFinal(id, dados) {
		return Simulado.updateOne({ _id: id }, { $set: dados });
	}
}

export default SimuladoModel;