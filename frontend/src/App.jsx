import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home/index.jsx';
import Questions from './components/Questions/index.jsx';
import Box from '@mui/material/Box';
import NavBar from './components/core/navBar.jsx';

function App() {
	return (
		<BrowserRouter>
			<Box
				sx={{
					width: '65%',
					maxWidth: '1400px',
					margin: '0 auto'
				}}
			>
				<NavBar />

				<Routes>
					<Route
						path="/inicio"
						element={<Home />}
					/>
				</Routes>
				<Routes>
					<Route
						path="/questoes"
						element={<Questions />}
					/>
				</Routes>
			</Box>
		</BrowserRouter>
	);
}

export default App;
