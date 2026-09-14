import RankingService from '../services/ranking.service.js';

export async function ranking(req, res) {
	try {
		const periodo = req.query.periodo || 'dia';
		const resultado = await RankingService.buscar(periodo);
		res.status(200).json(resultado);
	} catch (erro) {
		res.status(erro.status ?? 500).json({
			mensagem: erro.message || 'Erro interno ao buscar ranking.',
			campos: erro.campos
		});
	}
}