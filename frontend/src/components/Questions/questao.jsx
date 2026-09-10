import { useParams, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AdSlot from '../core/adSlot';
import IndividualQuestion from './individualQuestion';

export default function Questao() {
	const { id } = useParams();

	return (
		<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 300px' } }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<IndividualQuestion id={id} />
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<AdSlot
					formato="vertical"
					titulo="Material de revisão gratuito"
				/>
				<Button
					component={Link}
					to="/questoes"
					variant="outlined"
				>
					Voltar ao banco de questões
				</Button>
			</Box>
		</Box>
	);
}
