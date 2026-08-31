import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home/index.jsx';
import Questions from './components/Questions/index.jsx';
import Box from '@mui/material/Box';
import NavBar from './components/core/navBar.jsx';
import Ranking from './components/PracticeExame/index.jsx';
import Profile from './components/Profile/index.jsx';
import Footer from './components/core/footer.jsx';
function App() {
	return (
		<BrowserRouter>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					minHeight: '100vh'
				}}
			>
				<Box
					sx={{
						width: '65%',
						maxWidth: '1400px',
						margin: '0 auto',
						flex: 1,
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					<NavBar />

					<Box
						component="main"
						sx={{
							flex: 1,
							minHeight: 0,
							pb: 4
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
								element={<Questions />}
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
								path="*"
								element={<Box sx={{ py: 6, textAlign: 'center' }}>Página não encontrada.</Box>}
							/>
						</Routes>
					</Box>
				</Box>
				<Footer />
			</Box>
		</BrowserRouter>
	);
}

export default App;
