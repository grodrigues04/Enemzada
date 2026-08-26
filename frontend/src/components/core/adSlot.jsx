import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CampaignIcon from '@mui/icons-material/Campaign';

export default function AdSlot({ formato = 'horizontal', titulo = 'Espaço publicitário' }) {
	const vertical = formato === 'vertical';
	return (
		<Paper
			variant="outlined"
			aria-label="Área de anúncio"
			sx={{
				p: 2,
				borderStyle: 'dashed',
				bgcolor: 'background.paper',
				display: 'flex',
				flexDirection: vertical ? 'column' : { xs: 'column', sm: 'row' },
				alignItems: vertical ? 'flex-start' : { xs: 'flex-start', sm: 'center' },
				gap: 1.5,
				minHeight: vertical ? 220 : 'auto'
			}}
		>
			<Chip
				icon={<CampaignIcon />}
				label="Anúncio"
				size="small"
			/>
			<Box>
				<Typography
					variant="subtitle2"
					sx={{ fontWeight: 800 }}
				>
					{titulo}
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
				>
					Os anúncios mantêm a plataforma gratuita. Ajude colegas no fórum e veja menos anúncios.
				</Typography>
			</Box>
		</Paper>
	);
}
