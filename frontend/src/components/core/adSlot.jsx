import { useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CampaignIcon from '@mui/icons-material/Campaign';

const LINK_GOOGLE_ADS = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const CLIENTE_ANUNCIOS = 'ca-pub-6788035463046392';

let scriptCarregado = false;

function carregarScriptAnuncios() {
	if (scriptCarregado || document.querySelector('script[src*="adsbygoogle.js"]')) {
		scriptCarregado = true;
		return;
	}
	const script = document.createElement('script');
	script.async = true;
	script.src = `${LINK_GOOGLE_ADS}?client=${CLIENTE_ANUNCIOS}`;
	script.crossOrigin = 'anonymous';
	document.head.appendChild(script);
	scriptCarregado = true;
}

export default function AdSlot({ formato = 'horizontal', slot, titulo = 'Espaço publicitário' }) {
	useEffect(() => {
		carregarScriptAnuncios();
		const tentarPush = setInterval(() => {
			if (window.adsbygoogle) {
				clearInterval(tentarPush);
				try {
					(window.adsbygoogle = window.adsbygoogle || []).push({});
				} catch {
					/* ignora erro do AdSense */
				}
			}
		}, 250);
		return () => clearInterval(tentarPush);
	}, []);

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
				flexDirection: 'column',
				alignItems: 'stretch',
				gap: 1.5,
				minHeight: vertical ? 220 : 'auto'
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: vertical ? 'column' : { xs: 'column', sm: 'row' },
					alignItems: vertical ? 'flex-start' : { xs: 'flex-start', sm: 'center' },
					gap: 1.5
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
			</Box>
			{slot && (
				<ins
					className="adsbygoogle"
					style={{ display: 'block', width: '100%' }}
					data-ad-client={CLIENTE_ANUNCIOS}
					data-ad-slot={slot}
					data-ad-format={vertical ? 'vertical' : 'horizontal'}
					data-full-width-responsive="true"
				/>
			)}
		</Paper>
	);
}