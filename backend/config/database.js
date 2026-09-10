import mongoose from 'mongoose';

export async function conectarBanco() {
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		throw new Error('MONGODB_URI não definida no arquivo .env');
	}

	await mongoose.connect(uri, {
		dbName: process.env.MONGODB_DB || 'dev'
	});

	console.log('Conectado ao MongoDB (cluster enemzada)');
}

export function desconectarBanco() {
	return mongoose.disconnect();
}