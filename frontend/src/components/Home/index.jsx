// import { Link } from '@tanstack/react-router';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AdSlot from '../core/adSlot.jsx';
import NavBar from '../core/navBar.jsx';
import { DISCIPLINAS, PROGRESSO_SEMANAL, QUESTOES, corArea } from '../../data';

export default function Home() {
	const totalSemana = PROGRESSO_SEMANAL.reduce((s, d) => s + d.questoes, 0);
	const metaSemana = PROGRESSO_SEMANAL.reduce((s, d) => s + d.meta, 0);
	const continuar = QUESTOES[0];
	const maximo = Math.max(...PROGRESSO_SEMANAL.map((d) => d.questoes), 1);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<NavBar />
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
					Você já resolveu 5 questões nesta semana. Estudar todo dia um pouco vale mais do que maratonar na véspera.
				</Typography>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
					<Button
						// component={Link}
						to="/questoes/$id"
						params={{ id: continuar.id }}
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
								Progresso semanal
							</Typography>
							<Chip
								icon={<LocalFireDepartmentIcon />}
								color="warning"
								variant="outlined"
								label="5 dias seguidos"
							/>
						</Box>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 1 }}
						>
							{totalSemana} de {metaSemana} questões da meta semanal
						</Typography>
						<LinearProgress
							variant="determinate"
							value={Math.min(100, (totalSemana / metaSemana) * 100)}
							sx={{ height: 10, borderRadius: 5, mb: 3 }}
						/>
						<Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 140 }}>
							{PROGRESSO_SEMANAL.map((d) => (
								<Box
									key={d.dia}
									sx={{ flex: 1, textAlign: 'center' }}
								>
									<Box
										role="img"
										aria-label={`${d.dia}: ${d.questoes} questões`}
										sx={{
											height: `${(d.questoes / maximo) * 110 + 4}px`,
											borderRadius: 1.5,
											bgcolor: d.questoes >= d.meta ? 'secondary.main' : 'primary.light',
											opacity: d.questoes === 0 ? 0.25 : 1,
											mb: 0.75
										}}
									/>
									<Typography
										variant="caption"
										color="text.secondary"
									>
										{d.dia}
									</Typography>
								</Box>
							))}
						</Box>
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
								Continuar de onde parou
							</Typography>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 800 }}
							>
								{continuar.titulo}
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mb: 2 }}
							>
								ENEM {continuar.ano} · {continuar.disciplina}
							</Typography>
							<Button
								// component={Link}
								to="/questoes/$id"
								params={{ id: continuar.id }}
								variant="contained"
								fullWidth
							>
								Retomar questão
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
					<Typography
						variant="h6"
						component="h2"
						sx={{ mb: 2 }}
					>
						Suas disciplinas
					</Typography>
					<Box
						sx={{
							display: 'grid',
							gap: 2,
							gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4,1fr)' }
						}}
					>
						{DISCIPLINAS.map((d) => (
							<Paper
								key={d.nome}
								variant="outlined"
								sx={{ p: 2 }}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
									<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: corArea(d.area) }} />
									<Typography
										variant="subtitle2"
										sx={{ fontWeight: 800 }}
									>
										{d.nome}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={d.progresso}
									sx={{ height: 8, borderRadius: 4, mb: 1 }}
								/>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{d.progresso}% · {d.questoes} questões disponíveis
								</Typography>
								<Divider sx={{ my: 1.5 }} />
								<Button
									// component={Link}
									to="/questoes"
									size="small"
									fullWidth
								>
									Praticar
								</Button>
							</Paper>
						))}
					</Box>
				</CardContent>
			</Card>
			<AdSlot titulo="Apostila gratuita de redação — parceiro EnemAberto" />
		</Box>
	);
}
