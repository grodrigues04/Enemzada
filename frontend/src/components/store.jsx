import { signal, computed } from '@preact/signals-react';
import axios from 'axios';
import { QUESTOES, nivelPorPontos } from '../data';
import user from '../signals/user';

const urlBackend = (import.meta.env.VITE_URL_BACKEND ?? import.meta.env.URL_BACKEND ?? '').replace(/\/+$/, '');

function estadoInicialQuestoes() {
	const mapa = {};
	QUESTOES.forEach((q) => {
		mapa[q.id] = {
			resolucoes: q.resolucoes.map((r) => ({ ...r, meuVoto: false })),
			comentarios: q.comentarios.map((c) => ({ ...c, respostas: [...c.respostas] })),
			respondida: null
		};
	});
	return mapa;
}

export const questoes = signal(estadoInicialQuestoes());
export const pontos = signal(320);
export const resolvidasSemana = signal(81);
export const alertaResposta = signal(null);

export const usuario = computed(() => ({
	nome: 'Você',
	iniciais: 'VC',
	pontos: pontos.value,
	nivel: nivelPorPontos(pontos.value)
}));

export async function restaurarSessao() {
	try {
		const { data } = await axios.get(`${urlBackend}/usuario/me`, { withCredentials: true });
		user.value = { ...data, autenticado: true, respostasSemConta: 0 };
	} catch {
		user.value = { autenticado: false, respostasSemConta: 0 };
	}
}

function atualizar(id, mudanca) {
	const atual = questoes.value[id] ?? { resolucoes: [], comentarios: [], respondida: null };
	questoes.value = { ...questoes.value, [id]: { ...atual, ...mudanca(atual) } };
}

export function responderQuestao(id, letra, resultado) {
	if (!user.value.autenticado && user.value.respostasSemConta >= 1) {
		alertaResposta.value = 'você precisa entrar com uma conta para responder mais questões';
		return;
	}
	if (user.value.autenticado) {
		const [ano, numero] = String(id).split('-');
		axios
			.post(
				`${urlBackend}/questions/log`,
				{
					question: {
						numero: Number(numero),
						ano: Number(ano),
						url: `https://api.enem.dev/v1/exams/${ano}/questions/${numero}`
					},
					resultado
				},
				{ withCredentials: true }
			)
			.catch(() => {});
	}
	if (!user.value.autenticado) {
		user.value = { ...user.value, respostasSemConta: (user.value.respostasSemConta ?? 0) + 1 };
	}
	atualizar(id, () => ({ respondida: letra }));
	resolvidasSemana.value += 1;
}

export function votarResolucao(id, resolucaoId) {
	atualizar(id, (q) => ({
		resolucoes: q.resolucoes.map((r) => (r.id === resolucaoId ? { ...r, votos: r.votos + (r.meuVoto ? -1 : 1), meuVoto: !r.meuVoto } : r))
	}));
}

export async function publicarResolucao(id, texto) {
	const adicionarLocal = () =>
		atualizar(id, (q) => ({
			resolucoes: [...q.resolucoes, { id: `r-${Date.now()}`, autor: 'Você', votos: 1, texto, meuVoto: true }]
		}));

	if (!user.value.autenticado) {
		adicionarLocal();
		pontos.value += 15;
		return;
	}

	try {
		const { data } = await axios.post(
			`${urlBackend}/resolucoes`,
			{ id_questao: id, conteudo: texto },
			{ withCredentials: true }
		);
		atualizar(id, (q) => ({
			resolucoes: [...q.resolucoes, { ...data, votos: 1, meuVoto: true }]
		}));
	} catch (erro) {
		console.error('Falha ao publicar resolução:', erro);
		adicionarLocal();
	}
	pontos.value += 15;
}

export async function publicarDuvida(id, texto) {
	const adicionarLocal = () =>
		atualizar(id, (q) => ({
			comentarios: [...q.comentarios, { id: `c-${Date.now()}`, autor: 'Você', texto, respostas: [] }]
		}));

	if (!user.value.autenticado) {
		adicionarLocal();
		return;
	}

	try {
		const { data } = await axios.post(
			`${urlBackend}/comentarios`,
			{ id_questao: id, conteudo: texto },
			{ withCredentials: true }
		);
		atualizar(id, (q) => ({
			comentarios: [...q.comentarios, { ...data, respostas: data.respostas ?? [] }]
		}));
	} catch (erro) {
		console.error('Falha ao publicar comentário:', erro);
		adicionarLocal();
	}
}

export async function responderDuvida(id, comentarioId, texto) {
	const adicionarLocal = () =>
		atualizar(id, (q) => ({
			comentarios: q.comentarios.map((c) =>
				c.id === comentarioId ? { ...c, respostas: [...c.respostas, { id: `cr-${Date.now()}`, autor: 'Você', texto }] } : c
			)
		}));

	if (!user.value.autenticado) {
		adicionarLocal();
		pontos.value += 10;
		return;
	}

	try {
		const { data } = await axios.post(
			`${urlBackend}/comentarios/${comentarioId}/respostas`,
			{ conteudo: texto },
			{ withCredentials: true }
		);
		atualizar(id, (q) => ({
			comentarios: q.comentarios.map((c) =>
				c.id === comentarioId ? { ...c, respostas: [...c.respostas, data] } : c
			)
		}));
	} catch (erro) {
		console.error('Falha ao responder comentário:', erro);
		adicionarLocal();
	}
	pontos.value += 10;
}

export async function carregarComentarios(id) {
	if (!user.value.autenticado) return;
	try {
		const { data } = await axios.get(`${urlBackend}/comentarios/questao/${id}`, { withCredentials: true });
		if (Array.isArray(data)) {
			atualizar(id, () => ({ comentarios: data }));
		}
	} catch (erro) {
		console.error('Falha ao carregar comentários:', erro);
	}
}

export async function carregarResolucoes(id) {
	if (!user.value.autenticado) return;
	try {
		const { data } = await axios.get(`${urlBackend}/resolucoes/questao/${id}`, { withCredentials: true });
		if (Array.isArray(data)) {
			atualizar(id, () => ({ resolucoes: data }));
		}
	} catch (erro) {
		console.error('Falha ao carregar resoluções:', erro);
	}
}
