import { useSignals, useSignal } from '@preact/signals-react/runtime';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alternativa from './Alternativa';
import Resolucoes from './Resolucoes';
import Comentarios from './Comentarios';

export default function IndividualQuestion({ id }) {
	useSignals();
	const aba = useSignal(0);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Alternativa id={id} />

			<Card>
				<Tabs
					value={aba.value}
					onChange={(e, v) => aba.value = v}
					sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
				>
					<Tab label="Resoluções" />
					<Tab label="Comentários" />
				</Tabs>

				{aba.value === 0 ? <Resolucoes id={id} /> : <Comentarios id={id} />}
			</Card>
		</Box>
	);
}
