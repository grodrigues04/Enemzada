import { useEffect } from 'react';
import { useSignals, useSignal } from '@preact/signals-react/runtime';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import user from '../../signals/user';
import AdSlot from '../core/adSlot.jsx';

const urlBackend = (import.meta.env.VITE_URL_BACKEND ?? import.meta.env.URL_BACKEND ?? '').replace(/\/+$/, '');
const urlEnem = 'https://api.enem.dev/v1/exams';

const LIMITE_QUESTOES_DIA = 90;

function contarQuestoesDoDia(questions, dia) {
	const unicas = new Map();
	for (const q of questions ?? []) {
		if (!unicas.has(q.index)) unicas.set(q.index, q);
	}
	const questaoUnica = [...unicas.values()];
	const ordemDia1 = ['linguagens', 'ciencias-humanas'];
	const ordemDia2 = ['ciencias-natureza', 'matematica'];

	function sortearPorDisciplina(disciplinas, pool) {
		const selecionadas = [];
		for (const disciplina of disciplinas) {
			selecionadas.push(
				...pool
					.filter((q) => q.discipline === disciplina)
					.sort((a, b) => a.index - b.index)
			);
		}
		return selecionadas;
	}

	function completarDia(principais, pool) {
		const escolhidas = [...principais];
		const usadas = new Set(escolhidas.map((q) => q.index));
		if (escolhidas.length < LIMITE_QUESTOES_DIA) {
			const restantes = pool
				.filter((q) => !usadas.has(q.index))
				.sort((a, b) => a.index - b.index);
			escolhidas.push(...restantes);
		}
		return escolhidas.slice(0, LIMITE_QUESTOES_DIA).length;
	}

	const principaisDia1 = sortearPorDisciplina(ordemDia1, questaoUnica);
	const escolhidasDia1 = completarDia(principaisDia1, questaoUnica);
	if (dia === 1) return escolhidasDia1;

	const usadasDia1 = new Set(principaisDia1.slice(0, LIMITE_QUESTOES_DIA).map((q) => q.index));
	const restante = questaoUnica.filter((q) => !usadasDia1.has(q.index));
	const principaisDia2 = sortearPorDisciplina(ordemDia2, restante);

	return completarDia(principaisDia2, restante);
}

const DESCRICAO_DIA = {
	1: 'Linguagens, Códigos e suas Tecnologias e Ciências Humanas e suas Tecnologias.',
	2: 'Ciências da Natureza e suas Tecnologias e Matemática e suas Tecnologias.'
};

function formatarTempo(segundos) {
	const total = Math.max(0, Math.round(segundos ?? 0));
	const horas = Math.floor(total / 3600);
	const min = Math.floor((total % 3600) / 60);
	const seg = total % 60;
	return `${String(horas).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

function formatarData(data) {
	return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data));
}

export default function Simulados() {
	useSignals();
	const navegar = useNavigate();
	const anos = useSignal([]);
	const carregandoAnos = useSignal(true);
	const erroAnos = useSignal(null);
	const anoSelecionado = useSignal(null);
	const diaSelecionado = useSignal(1);
	const totalDia = useSignal(null);
	const carregandoInfo = useSignal(false);
	const historico = useSignal([]);
	const carregandoHistorico = useSignal(true);
	const erroHistorico = useSignal(null);
	const iniciando = useSignal(false);
	const erroInicio = useSignal(null);

	useEffect(() => {
		let ativo = true;
		async function carregar() {
			carregandoAnos.value = true;
			erroAnos.value = null;
			try {
				const { data } = await axios.get(`${urlEnem}`);
				const provas = Array.isArray(data) ? data : [];
				if (ativo) {
					anos.value = provas.map((p) => p.year).sort((a, b) => b - a);
					if (provas.length > 0) anoSelecionado.value = anos.value[0];
				}
			} catch {
				if (ativo) erroAnos.value = 'Não foi possível carregar as provas disponíveis.';
			} finally {
				if (ativo) carregandoAnos.value = false;
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, []);

	useEffect(() => {
		if (!user.value.autenticado) return;
		let ativo = true;
		async function carregar() {
			carregandoHistorico.value = true;
			erroHistorico.value = null;
			try {
				const { data } = await axios.get(`${urlBackend}/simulado`, { withCredentials: true });
				if (ativo) historico.value = data;
			} catch {
				if (ativo) erroHistorico.value = 'Não foi possível carregar o histórico de simulados.';
			} finally {
				if (ativo) carregandoHistorico.value = false;
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, [user.value.autenticado]);

	useEffect(() => {
		if (!anoSelecionado.value || !diaSelecionado.value) return;
		let ativo = true;
		async function carregar() {
			carregandoInfo.value = true;
			totalDia.value = null;
			try {
				const { data } = await axios.get(`${urlEnem}/${anoSelecionado.value}`);
				if (ativo) totalDia.value = contarQuestoesDoDia(data.questions, diaSelecionado.value);
			} catch {
				if (ativo) totalDia.value = null;
			} finally {
				if (ativo) carregandoInfo.value = false;
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, [anoSelecionado.value, diaSelecionado.value]);

	async function comecar() {
		erroInicio.value = null;
		iniciando.value = true;
		try {
			const { data } = await axios.post(
				`${urlBackend}/simulado/iniciar`,
				{ year: anoSelecionado.value, day: diaSelecionado.value },
				{ withCredentials: true }
			);
			navegar(`/simulados/${data.id}`);
		} catch (e) {
			erroInicio.value = e.response?.data?.mensagem ?? 'Não foi possível iniciar o simulado. Tente novamente.';
		} finally {
			iniciando.value = false;
		}
	}

	if (!user.value.autenticado) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box>
					<Typography
						variant="h4"
						component="h1"
					>
						Simulados ENEM
					</Typography>
					<Typography color="text.secondary">Provas reais de edições anteriores para treinar no seu ritmo.</Typography>
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
							Entre para fazer simulados
						</Typography>
						<Typography color="text.secondary">Você precisa estar logado para iniciar uma prova do ENEM e salvar seus resultados.</Typography>
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

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box>
				<Typography
					variant="h4"
					component="h1"
				>
					Simulados ENEM
				</Typography>
				<Typography color="text.secondary">Escolha uma prova real e simule o dia do exame com cronômetro.</Typography>
			</Box>

			<Card>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Typography
						variant="h6"
						sx={{ fontWeight: 800 }}
					>
						Nova simulação
					</Typography>

					{erroAnos.value && <Alert severity="error">{erroAnos.value}</Alert>}

					{carregandoAnos.value ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
							<CircularProgress size={28} />
						</Box>
					) : (
						<>
							<TextField
								select
								label="Ano do ENEM"
								size="small"
								value={anoSelecionado.value ?? ''}
								onChange={(e) => (anoSelecionado.value = Number(e.target.value))}
							>
								{anos.value.map((ano) => (
									<MenuItem
										key={ano}
										value={ano}
									>
										ENEM {ano}
									</MenuItem>
								))}
							</TextField>

							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								{[1, 2].map((dia) => (
									<Button
										key={dia}
										variant={diaSelecionado.value === dia ? 'contained' : 'outlined'}
										onClick={() => (diaSelecionado.value = dia)}
									>
										Dia {dia}
									</Button>
								))}
							</Box>

							{anoSelecionado.value && (
								<Box
									sx={{
										p: 2,
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: 2,
										bgcolor: 'action.hover'
									}}
								>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.5 }}>
										<Chip
											size="small"
											label={`ENEM ${anoSelecionado.value}`}
											variant="outlined"
										/>
										<Chip
											size="small"
											label={`Dia ${diaSelecionado.value}`}
											color="secondary"
										/>
										{carregandoInfo.value && <CircularProgress size={16} />}
										{!carregandoInfo.value && totalDia.value != null && (
											<Chip
												size="small"
												label={`${totalDia.value} questões`}
												variant="outlined"
											/>
										)}
									</Box>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										{DESCRICAO_DIA[diaSelecionado.value]}
									</Typography>
								</Box>
							)}

							<Button
								variant="contained"
								size="large"
								startIcon={<PlayArrowIcon />}
								disabled={!anoSelecionado.value || carregandoInfo.value || iniciando.value}
								onClick={comecar}
							>
								{iniciando.value ? 'Preparando prova...' : 'Iniciar simulado'}
							</Button>

							{erroInicio.value && <Alert severity="error">{erroInicio.value}</Alert>}
						</>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<HistoryIcon color="primary" />
						<Typography
							variant="h6"
							sx={{ fontWeight: 800 }}
						>
							Histórico de simulados
						</Typography>
					</Box>

					{carregandoHistorico.value && (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
							<CircularProgress size={28} />
						</Box>
					)}

					{erroHistorico.value && <Alert severity="error">{erroHistorico.value}</Alert>}

					{!carregandoHistorico.value && !erroHistorico.value && historico.value.length === 0 && (
						<Alert severity="info">Você ainda não concluiu nenhum simulado.</Alert>
					)}

					{historico.value.length > 0 && (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
							{historico.value.map((item) => (
								<Box
									key={item.id}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 2,
										flexWrap: 'wrap',
										p: 2,
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: 2
									}}
								>
									<EventRepeatIcon color="secondary" />
									<Box sx={{ flex: 1, minWidth: 200 }}>
										<Typography
											variant="subtitle2"
											sx={{ fontWeight: 800 }}
										>
											ENEM {item.year} — Dia {item.day}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{formatarData(item.completedAt)}
										</Typography>
									</Box>
									<Box sx={{ textAlign: 'right' }}>
										<Typography
											variant="subtitle2"
											sx={{ fontWeight: 800, color: 'success.main' }}
										>
											{item.corretas}/{item.total} acertos · {item.acuracia}%
										</Typography>
										<Typography variant="caption" color="text.secondary">Tempo: {formatarTempo(item.elapsedTime)}</Typography>
									</Box>
									<Button
										component={Link}
										to={`/simulados/${item.id}`}
										variant="outlined"
									>
										Ver resultado
									</Button>
								</Box>
							))}
						</Box>
					)}
				</CardContent>
			</Card>

			<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
		</Box>
	);
}