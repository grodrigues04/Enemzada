import app from '../app.js';
import { conectarBanco } from '../config/database.js';

let promessaBanco = null;

export default async function handler(req, res) {
	try {
		if (!promessaBanco) {
			promessaBanco = conectarBanco().catch((erro) => {
				promessaBanco = null;
				throw erro;
			});
		}
		await promessaBanco;
		app(req, res);
	} catch (erro) {
		if (!res.headersSent) {
			res.status(500).json({ mensagem: erro.message || 'Erro interno.' });
		}
	}
}