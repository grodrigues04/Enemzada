import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home/index.jsx';
import Pesquisa from './components/Questions/pesquisa.jsx';
import Questao from './components/Questions/questao.jsx';
import Box from '@mui/material/Box';
import NavBar from './components/core/navBar.jsx';
import Ranking from './components/PracticeExame/index.jsx';
import Profile from './components/Profile/index.jsx';
import Footer from './components/core/footer.jsx';
import Cadastro from './components/User/cadastro.jsx';
import Login from './components/User/login.jsx';
import { useEffect } from 'react';
import { restaurarSessao } from './components/store';
function App() {
	useEffect(() => {
		restaurarSessao();
	}, []);
	return (
		<BrowserRouter>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					minHeight: '100vh'
				}}
			>
				<NavBar />

				<Box
					component="main"
					sx={{
						flex: 1,
						minHeight: 0,
						width: '100%',
						maxWidth: 1200,
						mx: 'auto',
						px: { xs: 2, sm: 3, md: 4 },
						pb: { xs: 3, md: 4 },
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					<Routes>
						<Route
							path="/inicio"
							element={<Home />}
						/>
						<Route
							path="/"
							element={<Home />}
						/>
						<Route
							path="/questoes"
							element={<Pesquisa />}
						/>
						<Route
							path="/questoes/:id"
							element={<Questao />}
						/>
						<Route
							path="/ranking"
							element={<Ranking />}
						/>
						<Route
							path="/perfil"
							element={<Profile />}
						/>
						<Route
							path="/cadastro"
							element={<Cadastro />}
						/>
						<Route
							path="/login"
							element={<Login />}
						/>
						<Route
							path="*"
							element={<Box sx={{ py: 6, textAlign: 'center' }}>Página não encontrada.</Box>}
						/>
					</Routes>
				</Box>

				<Footer />
			</Box>
		</BrowserRouter>
	);
}

export default App;
