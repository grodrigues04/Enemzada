import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import userRouter from './routes/user.routes.js';
import questionRouter from './routes/questions.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN);
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}
	next();
});

app.get('/', (req, res) => {
	res.json({ mensagem: 'API ENENZADA' });
});
app.use('/questions', questionRouter);
app.use('/usuario', userRouter);

app.use((req, res) => {
	res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

export default app;
