import jwt from 'jsonwebtoken';

function autenticar(req, res, next) {
	const token = req.cookies.token;
	console.log('Token', token);
	if (!token) {
		console.error('Token invalido para a requisição na rota:', req.originalUrl);
		return res.status(401).json({
			mensagem: 'Token não informado'
		});
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);

		req.usuario = payload;

		next();
	} catch {
		return res.status(401).json({
			mensagem: 'Token inválido ou expirado'
		});
	}
}

export default autenticar;
