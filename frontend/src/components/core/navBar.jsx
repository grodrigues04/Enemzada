import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import BoltIcon from '@mui/icons-material/Bolt';
import { Link } from 'react-router-dom';

const pages = [
	{ to: '/', rotulo: 'Início' },
	{ to: '/questoes', rotulo: 'Questões' },
	{ to: '/simulados', rotulo: 'Simulados' },
	{ to: '/ranking', rotulo: 'Ranking' },
	{ to: '/perfil', rotulo: 'Perfil' }
];

export default function NavBar() {
	const [aberto, setAberto] = useState(false);

	return (
		<AppBar
			position="sticky"
			color="inherit"
			elevation={0}
			sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
		>
			<Toolbar sx={{ gap: 1, maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}>
				<Box
					// component={Link}
					to="/"
					sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 2 }}
					aria-label="ENENZADA"
				>
					<Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
						<SchoolIcon fontSize="small" />
					</Avatar>
					<Typography
						variant="h6"
						sx={{ color: 'text.primary', letterSpacing: -0.5 }}
					>
						Enem
						<Box
							component="span"
							sx={{ color: 'primary.main' }}
						>
							Zada
						</Box>
					</Typography>
				</Box>

				<Box
					component="nav"
					sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}
				>
					{pages.map((l) => (
						<Link to={l.to}>
							<Button
								to={l.to}
								sx={{
									color: 'primary.main',
									bgcolor: 'action.hover',
									px: 1.75,
									borderRadius: 3
								}}
							>
								{l.rotulo}
							</Button>
						</Link>
					))}
				</Box>

				<Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

				<Chip
					icon={<BoltIcon />}
					color="secondary"
					variant="outlined"
					label={`gustavo 90 pts`}
					sx={{ fontWeight: 700 }}
				/>
				<Avatar
					to="/perfil"
					sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: 14, textDecoration: 'none' }}
				>
					gbr
				</Avatar>

				<IconButton
					onClick={() => setAberto(true)}
					sx={{ display: { md: 'none' } }}
					aria-label="Abrir menu de navegação"
				>
					<MenuIcon />
				</IconButton>
			</Toolbar>

			<Drawer
				anchor="right"
				open={aberto}
				onClose={() => setAberto(false)}
			>
				<Box
					sx={{ width: 240 }}
					role="presentation"
					onClick={() => setAberto(false)}
				>
					<List>
						{pages.map((l) => (
							<ListItemButton
								key={l.to}
								to={l.to}
							>
								<ListItemText primary={l.rotulo} />
							</ListItemButton>
						))}
					</List>
				</Box>
			</Drawer>
		</AppBar>
	);
}
