import { useSignals, useSignal } from '@preact/signals-react/runtime';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { questoes, votarResolucao, publicarResolucao } from '../../store';

export default function Resolucoes({ id }) {
	useSignals();
	const novaResolucao = useSignal('');
	const resolucoes = questoes.value[id]?.resolucoes ?? [];
	const ordenadas = [...resolucoes].sort((a, b) => b.votos - a.votos);

	return (
		<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			{ordenadas.length === 0 && (
				<Alert severity="info">Ainda não há resoluções para esta questão. Seja a primeira pessoa a explicar.</Alert>
			)}

			{ordenadas.map((r, indice) => (
				<Paper
					key={r.id}
					variant="outlined"
					sx={{ p: 2, display: 'flex', gap: 2 }}
				>
					<Box sx={{ textAlign: 'center' }}>
						<Tooltip title={r.meuVoto ? 'Remover voto' : 'Votar nesta resolução'}>
							<IconButton
								color={r.meuVoto ? 'primary' : 'default'}
								onClick={() => votarResolucao(id, r.id)}
								aria-label={`Votar na resolução de ${r.autor}`}
							>
								{r.meuVoto ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
							</IconButton>
						</Tooltip>
						<Typography variant="subtitle2">{r.votos}</Typography>
					</Box>
					<Box sx={{ flex: 1 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 800 }}
							>
								{r.autor}
							</Typography>
							{indice === 0 && (
								<Chip
									size="small"
									color="secondary"
									icon={<EmojiEventsIcon />}
									label="Melhor resolução"
								/>
							)}
						</Box>
						<Typography
							variant="body2"
							sx={{ lineHeight: 1.7 }}
						>
							{r.texto}
						</Typography>
					</Box>
				</Paper>
			))}

			<Divider />
			<Typography
				variant="subtitle2"
				sx={{ fontWeight: 800 }}
			>
				Explique do seu jeito e ganhe 15 pontos
			</Typography>
			<TextField
				label="Sua resolução"
				multiline
				minRows={3}
				value={novaResolucao.value}
				onChange={(e) => novaResolucao.value = e.target.value}
			/>
			<Button
				variant="contained"
				sx={{ alignSelf: 'flex-start' }}
				disabled={novaResolucao.value.trim().length < 10}
				onClick={() => {
					publicarResolucao(id, novaResolucao.value.trim());
					novaResolucao.value = '';
				}}
			>
				Publicar resolução
			</Button>
		</CardContent>
	);
}
