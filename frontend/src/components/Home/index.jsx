import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignals, useSignal } from '@preact/signals-react/runtime';
import axios from 'axios';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AdSlot from '../core/adSlot.jsx';
import user from '../../signals/user.js';
import { QUESTOES } from '../../data';

const urlBackend = (import.meta.env.VITE_URL_BACKEND ?? import.meta.env.URL_BACKEND ?? '').replace(/\/+$/, '');
const urlEnem = 'https://api.enem.dev/v1/exams';
const ANOS_SORTEIO = Array.from({ length: 15 }, (_, i) => 2023 - i);
const NOMES_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function nomeDoDia(data) {
	const [ano, mes, dia] = String(data).split('-').map(Number);
	return NOMES_DIAS[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()];
}

export default function Home() {
	useSignals();
	const navegar = useNavigate();
	const semana = useSignal([]);
	const contexto = useSignal(null);
	const aviso = useSignal(null);
	const totalSemana = semana.value.reduce((soma, d) => soma + d.questoes, 0);
	const maximo = Math.max(...semana.value.map((d) => d.questoes), 1);

	useEffect(() => {
		if (!user.value.autenticado) return;

		let ativo = true;
		async function carregar() {
			try {
				const [resultadoSemana, resultadoDesafio] = await Promise.all([
					axios.get(`${urlBackend}/questions/desempenho-semanal`, { withCredentials: true }),
					axios.get(`${urlBackend}/desafio`, { withCredentials: true })
				]);
				if (!ativo) return;
				semana.value = resultadoSemana.data?.dias ?? [];
				contexto.value = resultadoDesafio.data;
			} catch {
				// mantém o estado padrão silenciosamente
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, [user.value.autenticado]);

	async function sortearQuestao() {
		aviso.value = null;
		for (let tentativa = 0; tentativa < 6; tentativa += 1) {
			const ano = ANOS_SORTEIO[Math.floor(Math.random() * ANOS_SORTEIO.length)];
			const offset = Math.floor(Math.random() * 190);
			try {
				const { data: resultado } = await axios.get(`${urlEnem}/${ano}/questions`, {
					params: { limit: 1, offset }
				});
				const questao = resultado?.questions?.[0];
				if (questao) {
					navegar(`/questoes/${questao.year}-${questao.index}`);
					return;
				}
			} catch {
				// tenta outra combinação de ano e posição
			}
		}
		aviso.value = 'Não foi possível sortear uma questão agora. Tente novamente em instantes.';
	}

	const desafios = contexto.value?.desafio?.questions ?? [];
	const acertos = desafios.filter((q) => q.result).length;
	const erros = desafios.length - acertos;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Paper
				sx={{
					p: { xs: 3, md: 4 },
					color: '#fff',
					background: 'linear-gradient(135deg,#4338ca 0%,#6d63f0 55%,#00a58e 140%)'
				}}
			>
				<Chip
					label="Plataforma gratuita e feita pela comunidade"
					size="small"
					sx={{ bgcolor: 'rgba(255,255,255,.18)', color: '#fff', fontWeight: 700, mb: 1.5 }}
				/>
				<Typography
					variant="h4"
					component="h1"
					sx={{ mb: 1 }}
				>
					Bom te ver de novo! Bora manter o ritmo?
				</Typography>
				<Typography sx={{ opacity: 0.92, maxWidth: 620, mb: 3 }}>
					{user.value.autenticado
						? `Você já resolveu ${totalSemana} ${totalSemana === 1 ? 'questão' : 'questões'} nesta semana. Estudar todo dia um pouco vale mais do que maratonar na véspera.`
						: 'Estudar todo dia um pouco vale mais do que maratonar na véspera. Entre para acompanhar seu desempenho.'}
				</Typography>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
					<Button
						// component={Link}
						to="/questoes/$id"
						params={{ id: QUESTOES[0].id }}
						variant="contained"
						size="large"
						startIcon={<PlayArrowIcon />}
						sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f1f1ff' } }}
					>
						Continuar estudos
					</Button>
					<Button
						// component={Link}
						to="/questoes"
						variant="outlined"
						size="large"
						sx={{ borderColor: 'rgba(255,255,255,.6)', color: '#fff' }}
					>
						Resolver questões
					</Button>
					<Button
						// component={Link}
						to="/simulados"
						variant="outlined"
						size="large"
						startIcon={<TimerIcon />}
						sx={{ borderColor: 'rgba(255,255,255,.6)', color: '#fff' }}
					>
						Iniciar simulado
					</Button>
				</Box>
			</Paper>

			<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
				<Card>
					<CardContent>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography
								variant="h6"
								component="h2"
							>
								Desempenho semanal
							</Typography>
							{user.value.autenticado && contexto.value?.streak_diaria > 0 && (
								<Chip
									icon={<LocalFireDepartmentIcon />}
									color="warning"
									variant="outlined"
									label={`${contexto.value.streak_diaria} ${contexto.value.streak_diaria === 1 ? 'dia' : 'dias'} seguidos`}
								/>
							)}
						</Box>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 1 }}
						>
							{totalSemana} {totalSemana === 1 ? 'questão respondida' : 'questões respondidas'} nesta semana
						</Typography>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'flex-end',
								gap: { xs: 0.75, sm: 1.5 },
								height: 170,
								pt: 2
							}}
						>
							{semana.value.map((d) => (
								<Tooltip
									key={d.data}
									title={`${nomeDoDia(d.data)}, ${d.questoes} ${d.questoes === 1 ? 'questão' : 'questões'} respondida${d.questoes === 1 ? '' : 's'}`}
									placement="top"
									arrow
								>
									<Box
										sx={{
											flex: 1,
											minWidth: 0,
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'flex-end',
											alignItems: 'center'
										}}
									>
										<Typography
											variant="caption"
											sx={{
												fontWeight: 800,
												mb: 0.5,
												color: d.questoes > 0 ? 'text.primary' : 'text.disabled'
											}}
										>
											{d.questoes}
										</Typography>
										<Box
											role="img"
											aria-label={`${nomeDoDia(d.data)}: ${d.questoes} questões`}
											sx={{
												width: '100%',
												maxWidth: 44,
												height: `${d.questoes === 0 ? 5 : Math.max(12, (d.questoes / maximo) * 110)}px`,
												borderRadius: '10px 10px 4px 4px',
												bgcolor: d.questoes > 0 ? 'secondary.main' : 'divider',
												opacity: d.questoes === 0 ? 0.35 : 1,
												transition: 'height .2s ease'
											}}
										/>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ mt: 0.75 }}
										>
											{nomeDoDia(d.data)}
										</Typography>
									</Box>
								</Tooltip>
							))}
						</Box>
						{!user.value.autenticado && (
							<Alert
								severity="info"
								sx={{ mt: 2 }}
							>
								Entre para registrar suas questões e acompanhar o desempenho semanal.
							</Alert>
						)}
					</CardContent>
				</Card>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					<Card>
						<CardContent>
							<Typography
								variant="h6"
								component="h2"
								sx={{ mb: 1.5 }}
							>
								Fazer uma questão aleatória
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mb: 2 }}
							>
								Pratique com uma questão sorteada de qualquer edição do ENEM.
							</Typography>
							<Button
								variant="contained"
								fullWidth
								startIcon={<AutoAwesomeIcon />}
								onClick={sortearQuestao}
							>
								Sortear questão
							</Button>
						</CardContent>
					</Card>
					<AdSlot
						formato="vertical"
						titulo="Seu curso preparatório aqui"
					/>
				</Box>
			</Box>

			<Card>
				<CardContent>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
						<TrendingUpIcon color="primary" />
						<Typography
							variant="h6"
							component="h2"
						>
							Resultado do desafio diário
						</Typography>
					</Box>

					{!user.value.autenticado ? (
						<>
							<Typography color="text.secondary">
								Entre para fazer o desafio de 5 questões e acompanhar o resultado de cada uma.
							</Typography>
							<CardActions sx={{ px: 0, pt: 2, gap: 1 }}>
								<Button
									component={Link}
									to="/desafio-diario"
									variant="contained"
								>
									Ir para o desafio
								</Button>
								<Button
									component={Link}
									to="/login"
									variant="outlined"
								>
									Entrar
								</Button>
							</CardActions>
						</>
					) : contexto.value?.concluidoHoje ? (
						<>
							<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
								<Typography variant="body2" sx={{ fontWeight: 700 }}>
									<Box component="span" sx={{ color: 'success.main' }}>{acertos} acertos</Box>
									{' · '}
									<Box component="span" sx={{ color: 'error.main' }}>{erros} erros</Box>
									<Box component="span" color="text.secondary"> · 5 questões</Box>
								</Typography>
							</Box>
							<Box
								sx={{
									display: 'grid',
									gap: 1.5,
									gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(5,1fr)' }
								}}
							>
								{desafios.map((q, indice) => (
									<Button
										key={`${q.year}-${q.questionNumber}`}
										component={Link}
										to={`/questoes/${q.year}-${q.questionNumber}`}
										variant="outlined"
										sx={{
											display: 'flex',
											flexDirection: 'column',
											gap: 0.5,
											alignItems: 'center',
											textTransform: 'none',
											p: 1.5
										}}
									>
										{q.result
											? <CheckCircleIcon sx={{ color: 'success.main' }} />
											: <CancelIcon sx={{ color: 'error.main' }} />}
										<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
											Questão {indice + 1}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											ENEM {q.year} · nº {q.questionNumber}
										</Typography>
										{q.result ? 'Você acertou' : 'Você errou'}
									</Button>
								))}
							</Box>
						</>
					) : (
						<>
							<Typography color="text.secondary">
								Você ainda não fez o desafio de hoje. Responda 5 questões aleatórias, descubra o resultado de cada uma
								e mantenha sua sequência de dias seguidos acesa!
							</Typography>
							<CardActions sx={{ px: 0, pt: 2, gap: 1 }}>
								<Button
									component={Link}
									to="/desafio-diario"
									variant="contained"
									size="large"
									startIcon={<EmojiEventsIcon />}
								>
									Fazer o desafio diário
								</Button>
							</CardActions>
						</>
					)}
				</CardContent>
			</Card>
			<AdSlot titulo="Apostila gratuita de redação — parceiro EnemAberto" />

			<Snackbar
				open={Boolean(aviso.value)}
				autoHideDuration={5000}
				onClose={() => (aviso.value = null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					severity="error"
					onClose={() => (aviso.value = null)}
				>
					{aviso.value}
				</Alert>
			</Snackbar>
		</Box>
	);
}