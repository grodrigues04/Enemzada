import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// Layout geral da aplicação: navegação, conteúdo e rodapé.
export default function Footer() {
	return (
		<Box
			component="footer"
			sx={{
				width: '100%',
				height: 90,
				minHeight: 90,
				maxHeight: 90,
				flexShrink: 0,
				display: 'flex',
				alignItems: 'center',
				borderTop: '1px solid',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				boxSizing: 'border-box',
				overflow: 'hidden'
			}}
		>
			<Container
				maxWidth="lg"
				sx={{
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					py: 0
				}}
			>
				<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.25 }}>
					<Typography
						variant="body2"
						sx={{ fontWeight: 700, lineHeight: 1.2 }}
					>
						EnemAberto — estudar para o ENEM não deveria custar nada.
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ lineHeight: 1.2 }}
					>
						Conteúdo produzido pela comunidade. Os anúncios mantêm a plataforma gratuita; quem ajuda colegas vê menos anúncios.
					</Typography>
				</Box>
			</Container>
		</Box>
	);
}
