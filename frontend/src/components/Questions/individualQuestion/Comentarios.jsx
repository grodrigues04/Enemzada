import { useEffect } from 'react';
import { useSignals, useSignal } from '@preact/signals-react/runtime';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { questoes, publicarDuvida, responderDuvida, carregarComentarios } from '../../store';

export default function Comentarios({ id }) {
	useSignals();
	const novaDuvida = useSignal('');
	const respostas = useSignal({});
	const comentarios = questoes.value[id]?.comentarios ?? [];

	useEffect(() => {
		carregarComentarios(id);
	}, [id]);

	return (
		<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<TextField
				label="Publique sua dúvida sobre esta questão"
				multiline
				minRows={2}
				value={novaDuvida.value}
				onChange={(e) => novaDuvida.value = e.target.value}
			/>
			<Button
				variant="contained"
				sx={{ alignSelf: 'flex-start' }}
				disabled={novaDuvida.value.trim().length < 5}
				onClick={() => {
					publicarDuvida(id, novaDuvida.value.trim());
					novaDuvida.value = '';
				}}
			>
				Enviar dúvida
			</Button>

			{comentarios.length === 0 && (
				<Alert severity="info">Ainda não há dúvidas aqui. Seja a primeira pessoa a perguntar.</Alert>
			)}

			{comentarios.map((c) => (
				<Paper
					key={c.id}
					variant="outlined"
					sx={{ p: 2 }}
				>
					<Box sx={{ display: 'flex', gap: 1.5 }}>
						<Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>{c.autor.slice(0, 2)}</Avatar>
						<Box sx={{ flex: 1 }}>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 800 }}
							>
								{c.autor}
							</Typography>
							<Typography variant="body2">{c.texto}</Typography>
						</Box>
					</Box>

					<Box sx={{ pl: 5.5, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						{c.respostas.map((r) => (
							<Box
								key={r.id}
								sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 1.5 }}
							>
								<Typography
									variant="caption"
									sx={{ fontWeight: 800 }}
								>
									{r.autor}
								</Typography>
								<Typography variant="body2">{r.texto}</Typography>
							</Box>
						))}

						<Box sx={{ display: 'flex', gap: 1 }}>
							<TextField
								size="small"
								fullWidth
								placeholder="Responder a esta dúvida (+10 pontos)"
								value={respostas.value[c.id] || ''}
								onChange={(e) => respostas.value = { ...respostas.value, [c.id]: e.target.value }}
							/>
							<Button
								disabled={!respostas.value[c.id] || respostas.value[c.id].trim().length < 3}
								onClick={() => {
									responderDuvida(id, c.id, respostas.value[c.id].trim());
									respostas.value = { ...respostas.value, [c.id]: '' };
								}}
							>
								Responder
							</Button>
						</Box>
					</Box>
				</Paper>
			))}
		</CardContent>
	);
}
