import { createContext, useContext, useMemo, useState } from 'react';
import { QUESTOES, nivelPorPontos } from '../data';

// Estado local de demonstração (sem backend). Tudo vive em memória.
const AppContext = createContext(null);

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

export function AppProvider({ children }) {
	const [questoes, setQuestoes] = useState(estadoInicialQuestoes);
	const [pontos, setPontos] = useState(320);
	const [resolvidasSemana, setResolvidasSemana] = useState(81);

	const valor = useMemo(() => {
		const usuario = { nome: 'Você', iniciais: 'VC', pontos, nivel: nivelPorPontos(pontos) };

		function atualizar(id, mudanca) {
			setQuestoes((atual) => ({ ...atual, [id]: { ...atual[id], ...mudanca(atual[id]) } }));
		}

		return {
			usuario,
			questoes,
			resolvidasSemana,
			responderQuestao(id, letra) {
				atualizar(id, () => ({ respondida: letra }));
				setResolvidasSemana((n) => n + 1);
			},
			votarResolucao(id, resolucaoId) {
				atualizar(id, (q) => ({
					resolucoes: q.resolucoes.map((r) =>
						r.id === resolucaoId ? { ...r, votos: r.votos + (r.meuVoto ? -1 : 1), meuVoto: !r.meuVoto } : r
					)
				}));
			},
			publicarResolucao(id, texto) {
				atualizar(id, (q) => ({
					resolucoes: [...q.resolucoes, { id: `r-${Date.now()}`, autor: 'Você', votos: 1, texto, meuVoto: true }]
				}));
				setPontos((p) => p + 15);
			},
			publicarDuvida(id, texto) {
				atualizar(id, (q) => ({
					comentarios: [...q.comentarios, { id: `c-${Date.now()}`, autor: 'Você', texto, respostas: [] }]
				}));
			},
			responderDuvida(id, comentarioId, texto) {
				atualizar(id, (q) => ({
					comentarios: q.comentarios.map((c) =>
						c.id === comentarioId
							? {
									...c,
									respostas: [...c.respostas, { id: `cr-${Date.now()}`, autor: 'Você', texto }]
								}
							: c
					)
				}));
				setPontos((p) => p + 10);
			}
		};
	}, [questoes, pontos, resolvidasSemana]);

	return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
	const ctx = useContext(AppContext);
	if (!ctx) throw new Error('useApp precisa estar dentro de AppProvider');
	return ctx;
}
