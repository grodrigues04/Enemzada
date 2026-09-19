import { useSignals, useSignal } from '@preact/signals-react/runtime';
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
import user from '../../signals/user';
const pages = [
	{ to: '/questoes', rotulo: 'Questões' },
	// { to: '/simulados', rotulo: 'Simulados' },
	{ to: '/ranking', rotulo: 'Ranking' },
	{ to: '/desafio-diario', rotulo: 'Desafio Diário' },
	{ to: '/perfil', rotulo: 'Perfil' }
];

export default function NavBar() {
	useSignals();
	const aberto = useSignal(false);

	const paginasVisiveis = pages.filter((p) => user.value.autenticado || p.to !== '/desafio-diario');

	return (
		<AppBar
			position="sticky"
			color="inherit"
			elevation={0}
			sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
		>
			<Toolbar
				sx={{
					gap: 1,
					minHeight: { xs: 52, md: 56 },
					maxWidth: 1200,
					width: '100%',
					mx: 'auto',
					px: { xs: 2, sm: 3, md: 4 }
				}}
			>
				<Box
					component={Link}
					to="/"
					sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 1.5, flexShrink: 0 }}
					aria-label="ENENZADA"
				>
					<Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
						<SchoolIcon fontSize="small" />
					</Avatar>
					<Typography
						variant="h6"
						sx={{ color: 'text.primary', letterSpacing: -0.5, fontSize: { xs: 20, md: 22 }, whiteSpace: 'nowrap' }}
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
					sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1, minWidth: 0 }}
				>
					{paginasVisiveis.map((l) => (
						<Link
							key={l.to}
							to={l.to}
						>
							<Button
								to={l.to}
								size="small"
								sx={{
									color: 'primary.main',
									bgcolor: 'action.hover',
									px: 1.5,
									py: 0.5,
									borderRadius: 3,
									whiteSpace: 'nowrap'
								}}
							>
								{l.rotulo}
							</Button>
						</Link>
					))}
				</Box>

				<Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

				{!user.value.autenticado && (
					<Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
						<Button
							component={Link}
							to="/login"
							size="small"
							variant="outlined"
						>
							Entrar
						</Button>
						<Button
							component={Link}
							to="/cadastro"
							size="small"
							variant="contained"
						>
							Criar conta
						</Button>
					</Box>
				)}

				<Chip
					icon={<BoltIcon />}
					color="secondary"
					variant="outlined"
					size="small"
					label={user.value.autenticado ? user.value.nomeCompleto : 'Faça login para ver seus pontos'}
					sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' }, flexShrink: 0 }}
				/>

				<IconButton
					onClick={() => (aberto.value = true)}
					size="small"
					sx={{ display: { md: 'none' } }}
					aria-label="Abrir menu de navegação"
				>
					<MenuIcon />
				</IconButton>
			</Toolbar>

			<Drawer
				anchor="right"
				open={aberto.value}
				onClose={() => (aberto.value = false)}
			>
				<Box
					sx={{ width: 240 }}
					role="presentation"
					onClick={() => (aberto.value = false)}
				>
					<List>
						{paginasVisiveis.map((l) => (
							<ListItemButton
								key={l.to}
								component={Link}
								to={l.to}
							>
								<ListItemText primary={l.rotulo} />
							</ListItemButton>
						))}
						{!user.value.autenticado && (
							<>
								<ListItemButton
									component={Link}
									to="/login"
								>
									<ListItemText primary="Entrar" />
								</ListItemButton>
								<ListItemButton
									component={Link}
									to="/cadastro"
								>
									<ListItemText primary="Criar conta" />
								</ListItemButton>
							</>
						)}
					</List>
				</Box>
			</Drawer>
		</AppBar>
	);
}
