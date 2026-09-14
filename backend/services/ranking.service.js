import RankingModel from '../models/ranking.model.js';

class RankingService {
	static async buscar(periodo) {
		const agora = new Date();
		let inicio;

		switch (periodo) {
			case 'ano':
				inicio = new Date(agora.getFullYear(), 0, 1, 0, 0, 0, 0);
				break;
			case 'mes':
				inicio = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0);
				break;
			case 'semana': {
				inicio = new Date(agora);
				inicio.setDate(agora.getDate() - agora.getDay() + 1);
				inicio.setHours(0, 0, 0, 0);
				break;
			}
			default:
				inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
				break;
		}

		const ranking = await RankingModel.contarPorPeriodo(inicio, agora);

		return ranking.map((item) => ({
			_id: item._id,
			nome: item.nome,
			questoes: item.totalQuestoes
		}));
	}
}

export default RankingService;