import 'dotenv/config';
import app from './app.js';
import { conectarBanco } from './config/database.js';

const porta = process.env.PORT || 3000;

async function iniciar() {
	try {
		await conectarBanco();
		app.listen(porta, () => {
			console.log(`API rodando em http://localhost:${porta}`);
		});
	} catch (erro) {
		console.error('Falha ao iniciar o servidor:', erro.message);
		process.exit(1);
	}
}

iniciar();
