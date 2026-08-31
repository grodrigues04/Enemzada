import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AdSlot from '../core/adSlot.jsx';
import { RANKING } from '../../data';

const MEDALHAS = ['#e0a411', '#9aa2b1', '#c07a3e'];

export default function Ranking() {
	const lista = [...RANKING].sort((a, b) => b.questoes - a.questoes);
	const eu = lista.find((p) => p.euMesmo);
	const minhaPosicao = lista.indexOf(eu) + 1;
	const lider = lista[0];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box>
				<Typography
					variant="h4"
					component="h1"
				>
					Ranking semanal
				</Typography>
				<Typography color="text.secondary">
					Quem mais resolveu exercícios entre segunda e domingo. O ranking zera toda segunda-feira.
				</Typography>
			</Box>

			<Paper
				sx={{
					p: 3,
					color: '#fff',
					background: 'linear-gradient(120deg,#4338ca,#00a58e)',
					display: 'flex',
					alignItems: 'center',
					gap: 2,
					flexWrap: 'wrap'
				}}
			>
				<Avatar sx={{ bgcolor: 'rgba(255,255,255,.2)', width: 56, height: 56, fontWeight: 800 }}>{minhaPosicao}º</Avatar>
				<Box sx={{ flex: 1, minWidth: 220 }}>
					<Typography variant="h6">Sua posição nesta semana</Typography>
					<Typography sx={{ opacity: 0.9 }}>
						{eu.questoes} questões resolvidas · faltam {lider.questoes - eu.questoes} para alcançar a liderança.
					</Typography>
				</Box>
				<Chip
					label={`${eu.ajudas} colegas ajudados`}
					sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff' }}
				/>
			</Paper>

			<Card>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{lista.map((p, i) => (
						<Paper
							key={p.nome}
							variant="outlined"
							sx={{
								p: 1.75,
								display: 'flex',
								alignItems: 'center',
								gap: 2,
								borderColor: p.euMesmo ? 'primary.main' : 'divider',
								bgcolor: p.euMesmo ? 'action.hover' : 'transparent'
							}}
						>
							<Typography sx={{ width: 32, fontWeight: 800, color: MEDALHAS[i] || 'text.secondary' }}>{i + 1}º</Typography>
							<Avatar sx={{ bgcolor: p.euMesmo ? 'primary.main' : 'grey.300', fontSize: 14 }}>{p.avatar}</Avatar>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography
										variant="subtitle2"
										sx={{ fontWeight: 800 }}
										noWrap
									>
										{p.nome}
									</Typography>
									{i === 0 && (
										<EmojiEventsIcon
											fontSize="small"
											sx={{ color: MEDALHAS[0] }}
										/>
									)}
								</Box>
								<LinearProgress
									variant="determinate"
									value={(p.questoes / lider.questoes) * 100}
									sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
								/>
							</Box>
							<Box sx={{ textAlign: 'right' }}>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 800 }}
								>
									{p.questoes}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									questões
								</Typography>
							</Box>
						</Paper>
					))}
				</CardContent>
			</Card>

			<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
		</Box>
	);
}
