import 'dotenv/config';
import express from 'express';
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

export default app;