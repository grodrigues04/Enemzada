import { signal, computed } from '@preact/signals-react';
import { QUESTOES, nivelPorPontos } from '../data';

// Estado global de demonstração (sem backend) usando signals.
// Basta trocar as funções abaixo por chamadas fetch mantendo o mesmo formato de objeto.

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

export const usuario = computed(() => ({
	nome: 'Você',
	iniciais: 'VC',
	pontos: pontos.value,
	nivel: nivelPorPontos(pontos.value)
}));

function atualizar(id, mudanca) {
	const atual = questoes.value[id] ?? { resolucoes: [], comentarios: [], respondida: null };
	questoes.value = { ...questoes.value, [id]: { ...atual, ...mudanca(atual) } };
}

export function responderQuestao(id, letra) {
	atualizar(id, () => ({ respondida: letra }));
	resolvidasSemana.value += 1;
}

export function votarResolucao(id, resolucaoId) {
	atualizar(id, (q) => ({
		resolucoes: q.resolucoes.map((r) =>
			r.id === resolucaoId ? { ...r, votos: r.votos + (r.meuVoto ? -1 : 1), meuVoto: !r.meuVoto } : r
		)
	}));
}

export function publicarResolucao(id, texto) {
	atualizar(id, (q) => ({
		resolucoes: [...q.resolucoes, { id: `r-${Date.now()}`, autor: 'Você', votos: 1, texto, meuVoto: true }]
	}));
	pontos.value += 15;
}

export function publicarDuvida(id, texto) {
	atualizar(id, (q) => ({
		comentarios: [...q.comentarios, { id: `c-${Date.now()}`, autor: 'Você', texto, respostas: [] }]
	}));
}

export function responderDuvida(id, comentarioId, texto) {
	atualizar(id, (q) => ({
		comentarios: q.comentarios.map((c) =>
			c.id === comentarioId
				? { ...c, respostas: [...c.respostas, { id: `cr-${Date.now()}`, autor: 'Você', texto }] }
				: c
		)
	}));
	pontos.value += 10;
}