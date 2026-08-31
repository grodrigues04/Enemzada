import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AdSlot from '../core/adSlot.jsx';
import { NIVEIS } from '../../data';

export default function Profile() {
	// const { usuario } = useApp();
	const nivelAtual = { nome: 'Platina', nivelAtual: 30 };
	const proximo = NIVEIS[NIVEIS.indexOf(nivelAtual) + 1];
	// const progressoNivel = proximo ? ((usuario.pontos - nivelAtual.pontosMin) / (proximo.pontosMin - nivelAtual.pontosMin)) * 100 : 100;

	return (
		<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 300px' } }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Card>
					<CardContent sx={{ display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
						<Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 26 }}>Gustavo</Avatar>
						<Box sx={{ flex: 1, minWidth: 220 }}>
							<Typography
								variant="h5"
								component="h1"
							>
								Gustavo
							</Typography>
							<Typography color="text.secondary">Estudante desde março de 2026</Typography>
							<Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
								<Chip
									color="primary"
									label="Tester"
								/>
								<Chip
									variant="outlined"
									label={`320 pontos de ajuda`}
								/>
								<Chip
									color="secondary"
									variant="outlined"
									label={`25% menos anúncios`}
								/>
							</Box>
						</Box>
					</CardContent>
				</Card>

				<Card>
					<CardContent>
						<Typography
							variant="h6"
							component="h2"
							sx={{ mb: 1 }}
						>
							Pontos por ajudar colegas
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 1.5 }}
						>
							Faltam 80 pontos para o nível Mentor (50% menos anúncios).
							{/* {proximo
								? `Faltam ${proximo.pontosMin - usuario.pontos} pontos para o nível ${proximo.nome} (${proximo.reducaoAnuncios}% menos anúncios).`
								: 'Você atingiu o nível máximo. Obrigado por sustentar a comunidade!'} */}
						</Typography>
						<LinearProgress
							variant="determinate"
							value={30}
							sx={{ height: 10, borderRadius: 5, mb: 2.5 }}
						/>

						<Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
							{NIVEIS.map((n) => (
								<Paper
									key={n.nome}
									variant="outlined"
									sx={{
										p: 2,
										borderColor: n.nome === nivelAtual.nome ? 'primary.main' : 'divider',
										bgcolor: n.nome === nivelAtual.nome ? 'action.hover' : 'transparent'
									}}
								>
									<Typography
										variant="subtitle2"
										sx={{ fontWeight: 800 }}
									>
										{n.nome}
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
									>
										A partir de {n.pontosMin} pontos · {n.reducaoAnuncios}% menos anúncios
									</Typography>
								</Paper>
							))}
						</Box>

						<Divider sx={{ my: 2.5 }} />
						<Typography
							variant="subtitle2"
							sx={{ fontWeight: 800, mb: 1 }}
						>
							Como você ganha pontos
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							+15 pontos ao publicar uma resolução · +10 pontos ao responder a dúvida de um colega · +2 pontos por voto recebido em uma
							resolução sua.
						</Typography>
					</CardContent>
				</Card>

				<Alert
					icon={<VolunteerActivismIcon />}
					severity="info"
				>
					<Typography
						variant="subtitle2"
						sx={{ fontWeight: 800 }}
					>
						Nosso modelo, sem letras miúdas
					</Typography>
					A plataforma é e continuará gratuita. Os anúncios pagam os custos de manter tudo no ar. Quem ajuda colegas respondendo dúvidas e
					escrevendo resoluções acumula pontos e passa a visualizar menos anúncios. Não há assinatura, cobrança nem venda de dados.
				</Alert>
			</Box>

			<Box>
				<AdSlot
					formato="vertical"
					titulo={`Você vê ${100 - nivelAtual.reducaoAnuncios}% dos anúncios`}
				/>
			</Box>
		</Box>
	);
}
