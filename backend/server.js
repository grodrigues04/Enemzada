import 'dotenv/config';
import express from 'express';
import { conectarBanco } from './config/database.js';
import userRouter from './routes/user.routes.js';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}
	next();
});

app.get('/', (req, res) => {
	res.json({ mensagem: 'API ENENZADA' });
});

app.use('/usuario', userRouter);

app.use((req, res) => {
	res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

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