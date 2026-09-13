class ServicoErro extends Error {
	constructor(mensagem, status = 400, campos = null) {
		super(mensagem);
		this.status = status;
		this.campos = campos;
	}
}

class QuestionsService {
	static async ranking() {
		console.log('oi');
	}
}

export default QuestionsService;
