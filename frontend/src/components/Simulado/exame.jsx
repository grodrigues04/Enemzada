import { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSignals, useSignal } from '@preact/signals-react/runtime';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alternativa } from '../Questions/individualQuestion/Alternativa.jsx';
import { blocosDoContexto, renderMarkdownInline } from '../../utils/enunciado';
import user from '../../signals/user';
import AdSlot from '../core/adSlot.jsx';

const urlBackend = (import.meta.env.VITE_URL_BACKEND ?? import.meta.env.URL_BACKEND ?? '').replace(/\/+$/, '');

function formatarTempo(segundos) {
	const total = Math.max(0, Math.round(segundos ?? 0));
	const horas = Math.floor(total / 3600);
	const min = Math.floor((total % 3600) / 60);
	const seg = total % 60;
	return `${String(horas).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

function formatarData(data) {
	if (!data) return '';
	return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data));
}

export default function SimuladoExame() {
	useSignals();
	const { id } = useParams();
	const navegar = useNavigate();
	const carregando = useSignal(true);
	const tentativa = useSignal(null);
	const erro = useSignal(null);
	const atual = useSignal(0);
	const cache = useSignal({});
	const carregandoQ = useSignal(false);
	const erroQ = useSignal(null);
	const respostas = useSignal({});
	const aberturaConfirmacao = useSignal(false);
	const finalizando = useSignal(false);
	const agora = useSignal(0);
	const timerRef = useRef(null);

	const concluido = tentativa.value?.concluido === true;
	const listaQuestoes = tentativa.value?.questions ?? [];
	const questaoAtual = listaQuestoes[atual.value] ?? null;
	const total = listaQuestoes.length;
	const respondidas = Object.keys(respostas.value).length;
	const semResposta = total - respondidas;

	useEffect(() => {
		if (!user.value.autenticado) {
			carregando.value = false;
			return;
		}
		let ativo = true;
		async function carregar() {
			carregando.value = true;
			erro.value = null;
			try {
				const { data } = await axios.get(`${urlBackend}/simulado/${id}`, { withCredentials: true });
				if (!ativo) return;
				tentativa.value = data;
				const mapa = {};
				if (data.concluido) {
					data.questions.forEach((q) => {
						if (q.answer) mapa[q.questionNumber] = q.answer;
					});
				}
				respostas.value = mapa;
			} catch (e) {
				if (!ativo) return;
				erro.value = e.response?.data?.mensagem ?? 'Não foi possível carregar o simulado.';
			} finally {
				if (ativo) carregando.value = false;
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, [id, user.value.autenticado]);

	useEffect(() => {
		if (!tentativa.value || concluido) return;
		timerRef.current = setInterval(() => {
			agora.value = Date.now();
		}, 1000);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [tentativa.value?.id, concluido]);

	useEffect(() => {
		if (!questaoAtual || concluido) return;
		const qn = questaoAtual.questionNumber;
		if (cache.value[qn]) return;
		let ativo = true;
		async function carregar() {
			carregandoQ.value = true;
			erroQ.value = null;
			try {
				const { data } = await axios.get(questaoAtual.url);
				if (!ativo) return;
				cache.value = { ...cache.value, [qn]: data };
			} catch {
				if (!ativo) return;
				erroQ.value = 'Não foi possível carregar esta questão.';
			} finally {
				if (ativo) carregandoQ.value = false;
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, [questaoAtual?.questionNumber, concluido]);

	function salvarResposta(qn, letra) {
		if (concluido) return;
		const atual = respostas.value[qn] === letra ? null : letra;
		respostas.value = { ...respostas.value, [qn]: atual };
	}

	function anterior() {
		if (atual.value > 0) atual.value -= 1;
	}

	function proxima() {
		if (atual.value < total - 1) atual.value += 1;
	}

	const finalizarSimulado = useCallback(async () => {
		if (finalizando.value) return;
		finalizando.value = true;
		try {
			const answers = Object.entries(respostas.value).map(([questionNumber, answer]) => ({
				questionNumber: Number(questionNumber),
				answer
			}));
			await axios.post(`${urlBackend}/simulado/${id}/finalizar`, { answers }, { withCredentials: true });
			const { data } = await axios.get(`${urlBackend}/simulado/${id}`, { withCredentials: true });
			tentativa.value = data;
			if (timerRef.current) clearInterval(timerRef.current);
			navegar(`/simulados/${id}`, { replace: true });
		} catch (e) {
			erro.value = e.response?.data?.mensagem ?? 'Não foi possível finalizar o simulado.';
		} finally {
			finalizando.value = false;
			aberturaConfirmacao.value = false;
		}
	}, [id, respostas.value, navegar, finalizando.value, aberturaConfirmacao.value, tentativa.value]);

	if (!user.value.autenticado) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box>
					<Typography
						variant="h4"
						component="h1"
					>
						Simulado ENEM
					</Typography>
					<Typography color="text.secondary">Você precisa estar logado para acessar o simulado.</Typography>
				</Box>

				<Card>
					<CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
						<Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
							<LockOutlinedIcon />
						</Avatar>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800 }}
						>
							Entre para continuar
						</Typography>
						<Typography color="text.secondary">Faça login ou crie uma conta para participar do simulado.</Typography>
					</CardContent>
					<CardActions
						sx={{ justifyContent: 'center', pb: 2.5, gap: 1 }}
					>
						<Button
							component={Link}
							to="/login"
							variant="contained"
						>
							Entrar
						</Button>
						<Button
							component={Link}
							to="/cadastro"
							variant="outlined"
						>
							Criar conta
						</Button>
					</CardActions>
				</Card>

				<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
			</Box>
		);
	}

	if (carregando.value) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
				<CircularProgress size={32} />
			</Box>
		);
	}

	if (erro.value && !tentativa.value) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Alert severity="error">{erro.value}</Alert>
				<Button
					component={Link}
					to="/simulados"
					startIcon={<ArrowBackIcon />}
					sx={{ alignSelf: 'flex-start' }}
				>
					Voltar
				</Button>
				<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
			</Box>
		);
	}

	if (concluido) {
		return <TelaResultado tentativa={tentativa.value} />;
	}

	if (!questaoAtual) {
		return null;
	}

	const segundosDecorridos = Math.floor((agora.value - new Date(tentativa.value.startedAt).getTime()) / 1000);
	const dados = cache.value[questaoAtual.questionNumber] ?? null;
	const blocos = dados ? blocosDoContexto(dados) : [];
	const respostaAtual = respostas.value[questaoAtual.questionNumber] ?? null;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			{erro.value && <Alert severity="error">{erro.value}</Alert>}

			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
				<Typography
					variant="h6"
					sx={{ fontWeight: 800 }}
				>
					ENEM {tentativa.value.year} — Dia {tentativa.value.day}
				</Typography>
				<Chip
					icon={<HourglassBottomIcon />}
					color="warning"
					variant="outlined"
					label={formatarTempo(segundosDecorridos)}
					sx={{ fontWeight: 700 }}
				/>
				<Typography
					variant="subtitle2"
					color="text.secondary"
				>
					Questão {atual.value + 1} de {total}
				</Typography>
			</Box>

			<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 220px' } }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{carregandoQ.value && (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
							<CircularProgress size={32} />
						</Box>
					)}

					{erroQ.value && !carregandoQ.value && (
						<Alert severity="error">{erroQ.value}</Alert>
					)}

					{dados && !carregandoQ.value && (
						<Card>
							<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
									<Chip
										size="small"
										label={`Nº ${questaoAtual.index}`}
										variant="outlined"
									/>
									<Chip
										size="small"
										variant="outlined"
										label={questaoAtual.subject}
									/>
								</Box>

								{blocos.map((bloco, indiceBloco) =>
									bloco.tipo === 'imagem' ? (
										<Box
											key={`img-${indiceBloco}`}
											component="img"
											src={bloco.valor}
											alt={`Imagem do enunciado ${indiceBloco + 1}`}
											sx={{ maxWidth: '100%', maxHeight: 320, borderRadius: 1, alignSelf: 'center' }}
										/>
									) : (
										<Typography
											key={`txt-${indiceBloco}`}
											sx={{ lineHeight: 1.75 }}
										>
											{renderMarkdownInline(bloco.valor)}
										</Typography>
									)
								)}

								{dados.alternativesIntroduction && (
									<Typography sx={{ lineHeight: 1.75 }}>{dados.alternativesIntroduction}</Typography>
								)}

								{dados.alternatives.map((alt) => (
									<Alternativa
										key={alt.letter}
										alt={alt}
										selecionada={respostaAtual === alt.letter}
										respondida={null}
										correta={null}
										onSelect={() => salvarResposta(questaoAtual.questionNumber, alt.letter)}
									/>
								))}
							</CardContent>
						</Card>
					)}

					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Button
							startIcon={<ArrowBackIcon />}
							disabled={atual.value === 0}
							onClick={anterior}
						>
							Anterior
						</Button>
						<Button
							endIcon={<ArrowForwardIcon />}
							disabled={atual.value >= total - 1}
							onClick={proxima}
						>
							Próxima
						</Button>
					</Box>
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Card>
						<CardContent sx={{ pt: 2, pb: 2 }}>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 800, mb: 1 }}
							>
								Resumo
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
							>
								Respondidas: {respondidas}/{total}
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
							>
								Em branco: {semResposta}
							</Typography>

							<Divider sx={{ my: 1.5 }} />

							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
								{listaQuestoes.map((q, i) => {
									const r = respostas.value[q.questionNumber];
									const isAtual = i === atual.value;
									return (
										<Tooltip
											key={q.questionNumber}
											title={`Nº ${q.index} — ${q.subject}`}
											arrow
										>
											<Button
												size="small"
												variant={isAtual ? 'contained' : 'outlined'}
												color={isAtual ? 'primary' : r ? 'success' : 'inherit'}
												sx={{
													minWidth: 36,
													height: 32,
													p: 0,
													fontWeight: 800
												}}
												onClick={() => (atual.value = i)}
											>
												{q.questionNumber}
											</Button>
										</Tooltip>
									);
								})}
							</Box>
						</CardContent>
					</Card>

					<Button
						variant="contained"
						color="error"
						onClick={() => (aberturaConfirmacao.value = true)}
					>
						Finalizar simulado
					</Button>
				</Box>
			</Box>

			<Dialog
				open={aberturaConfirmacao.value}
				onClose={() => (aberturaConfirmacao.value = false)}
			>
				<DialogTitle>Você está prestes a concluir o simulado</DialogTitle>
				<DialogContent>
					<Typography gutterBottom>
						Responsdas: {respondidas}/{total}
					</Typography>
					<Typography color="text.secondary">
						Em branco: {semResposta}
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => (aberturaConfirmacao.value = false)}>Voltar</Button>
					<Button
						onClick={finalizarSimulado}
						variant="contained"
						color="error"
						disabled={finalizando.value}
					>
						{finalizando.value ? 'Salvando...' : 'Finalizar'}
					</Button>
				</DialogActions>
			</Dialog>

			<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
		</Box>
	);
}

function TelaResultado({ tentativa }) {
	useSignals();
	const revIndice = useSignal(null);
	const cache = useSignal({});
	const carregando = useSignal(false);
	const erro = useSignal(null);
	const questaoRevendo = tentativa.questions[revIndice.value] ?? null;

	useEffect(() => {
		if (!questaoRevendo || cache.value[questaoRevendo.questionNumber]) return;
		let ativo = true;
		async function carregar() {
			carregando.value = true;
			erro.value = null;
			try {
				const { data } = await axios.get(questaoRevendo.url);
				if (!ativo) return;
				cache.value = { ...cache.value, [questaoRevendo.questionNumber]: data };
			} catch {
				if (!ativo) return;
				erro.value = 'Não foi possível carregar esta questão.';
			} finally {
				if (ativo) carregando.value = false;
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, [questaoRevendo?.questionNumber]);

	const dados = cache.value[questaoRevendo?.questionNumber] ?? null;
	const blocos = dados ? blocosDoContexto(dados) : [];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box>
				<Typography
					variant="h4"
					component="h1"
				>
					ENEM {tentativa.year} — Dia {tentativa.day}
				</Typography>
				<Typography color="text.secondary">Resultado da simulação concluída em {formatarData(tentativa.completedAt)}.</Typography>
			</Box>

			{revIndice.value === null ? (
				<>
					<Card>
						<CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
							<Avatar sx={{ bgcolor: tentativa.corretas > tentativa.incorretas ? 'success.main' : 'secondary.main', width: 56, height: 56 }}>
								<CheckCircleIcon />
							</Avatar>
							<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', my: 1 }}>
								<Box sx={{ textAlign: 'center' }}>
									<Typography
										variant="h4"
										color="success.main"
										sx={{ fontWeight: 800 }}
									>
										{tentativa.corretas}
									</Typography>
									<Typography color="text.secondary">Corretas</Typography>
								</Box>
								<Box sx={{ textAlign: 'center' }}>
									<Typography
										variant="h4"
										color="error.main"
										sx={{ fontWeight: 800 }}
									>
										{tentativa.incorretas}
									</Typography>
									<Typography color="text.secondary">Incorretas</Typography>
								</Box>
								<Box sx={{ textAlign: 'center' }}>
									<Typography
										variant="h4"
										color="text.secondary"
										sx={{ fontWeight: 800 }}
									>
										{tentativa.semResposta}
									</Typography>
									<Typography color="text.secondary">Sem resposta</Typography>
								</Box>
								<Box sx={{ textAlign: 'center' }}>
									<Typography
										variant="h5"
										sx={{ fontWeight: 800 }}
									>
										{tentativa.acuracia}%
									</Typography>
									<Typography color="text.secondary">Acurácia</Typography>
								</Box>
								<Box sx={{ textAlign: 'center' }}>
									<Typography
										variant="h5"
										sx={{ fontWeight: 800 }}
									>
										{formatarTempo(tentativa.elapsedTime)}
									</Typography>
									<Typography color="text.secondary">Tempo</Typography>
								</Box>
							</Box>
						</CardContent>
					</Card>

					<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 220px' } }}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<Typography
								variant="h6"
								sx={{ fontWeight: 800 }}
							>
								Revisar questões
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
								{tentativa.questions.map((q, i) => {
									const cor = q.result === true ? 'success.main' : q.result === false ? 'error.main' : 'text.secondary';
									return (
										<Tooltip
											key={q.questionNumber}
											title={`Nº ${q.index} — ${q.subject}`}
											arrow
										>
											<Button
												size="small"
												variant="outlined"
												onClick={() => (revIndice.value = i)}
												sx={{
													minWidth: 36,
													height: 32,
													p: 0,
													fontWeight: 800,
													borderColor: cor,
													color: cor
												}}
											>
												{q.result === true
													? <CheckCircleIcon sx={{ fontSize: 18 }} />
													: q.result === false
														? <CancelIcon sx={{ fontSize: 18 }} />
														: q.questionNumber}
											</Button>
										</Tooltip>
									);
								})}
							</Box>
						</Box>
						<Box sx={{ display: { xs: 'none', md: 'block' } }}>
							<AdSlot
								formato="vertical"
								titulo="Material de revisão gratuito"
							/>
						</Box>
					</Box>
				</>
			) : (
				<>
					{erro.value && <Alert severity="error">{erro.value}</Alert>}
					{carregando.value && (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
							<CircularProgress size={32} />
						</Box>
					)}
					{dados && !carregando.value && (
						<Card>
							<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
									<Chip
										size="small"
										label={`Nº ${questaoRevendo.index}`}
										variant="outlined"
									/>
									<Chip
										size="small"
										variant="outlined"
										label={questaoRevendo.subject}
									/>
									<Chip
										size="small"
										color={questaoRevendo.result === true ? 'success' : questaoRevendo.result === false ? 'error' : 'default'}
										label={questaoRevendo.result === true ? 'Correta' : questaoRevendo.result === false ? 'Incorreta' : 'Sem resposta'}
									/>
									{questaoRevendo.answer && (
										<Chip
											size="small"
											variant="outlined"
											label={`Sua resposta: ${questaoRevendo.answer}`}
										/>
									)}
									<Chip
										size="small"
										color="success"
										label={`Resposta correta: ${questaoRevendo.correctAnswer}`}
									/>
								</Box>

								{blocos.map((bloco, indiceBloco) =>
									bloco.tipo === 'imagem' ? (
										<Box
											key={`img-${indiceBloco}`}
											component="img"
											src={bloco.valor}
											alt={`Imagem do enunciado ${indiceBloco + 1}`}
											sx={{ maxWidth: '100%', maxHeight: 320, borderRadius: 1, alignSelf: 'center' }}
										/>
									) : (
										<Typography
											key={`txt-${indiceBloco}`}
											sx={{ lineHeight: 1.75 }}
										>
											{renderMarkdownInline(bloco.valor)}
										</Typography>
									)
								)}

								{dados.alternativesIntroduction && (
									<Typography sx={{ lineHeight: 1.75 }}>{dados.alternativesIntroduction}</Typography>
								)}

								{dados.alternatives.map((alt) => (
									<Alternativa
										key={alt.letter}
										alt={alt}
										selecionada={questaoRevendo.answer === alt.letter}
										respondida={true}
										correta={questaoRevendo.correctAnswer}
										onSelect={() => {}}
									/>
								))}
							</CardContent>
						</Card>
					)}
					<Box sx={{ display: 'flex', gap: 1 }}>
						{questaoRevendo && (
							<>
								<Button
									disabled={revIndice.value <= 0}
									onClick={() => (revIndice.value = revIndice.value - 1)}
									startIcon={<ArrowBackIcon />}
								>
									Anterior
								</Button>
								<Button
									disabled={revIndice.value >= tentativa.questions.length - 1}
									onClick={() => (revIndice.value = revIndice.value + 1)}
									endIcon={<ArrowForwardIcon />}
								>
									Próxima
								</Button>
							</>
						)}
						<Button onClick={() => (revIndice.value = null)}>Voltar ao resumo</Button>
					</Box>
				</>
			)}

			<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
		</Box>
	);
}