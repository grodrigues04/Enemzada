import { useEffect } from 'react';
import { useSignals, useSignal } from '@preact/signals-react/runtime';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AdSlot from '../core/adSlot.jsx';

const urlBackend = (import.meta.env.VITE_URL_BACKEND ?? import.meta.env.URL_BACKEND ?? '').replace(/\/+$/, '');
const MEDALHAS = ['#e0a411', '#9aa2b1', '#c07a3e'];

const PERIODOS = [
	{ valor: 'dia', rotulo: 'Dia', titulo: 'Ranking de hoje', descricao: 'Quem mais resolveu exercícios hoje.' },
	{ valor: 'semana', rotulo: 'Semana', titulo: 'Ranking semanal', descricao: 'Quem mais resolveu exercícios esta semana.' },
	{ valor: 'mes', rotulo: 'Mês', titulo: 'Ranking mensal', descricao: 'Quem mais resolveu exercícios este mês.' },
	{ valor: 'ano', rotulo: 'Ano', titulo: 'Ranking anual', descricao: 'Quem mais resolveu exercícios este ano.' }
];

function gerarIniciais(nome) {
	const partes = nome.trim().split(/\s+/);
	if (partes.length === 0) return '';
	if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
	return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export default function Ranking() {
	useSignals();
	const aba = useSignal('dia');
	const carregando = useSignal(true);
	const erro = useSignal(null);
	const lista = useSignal([]);

	useEffect(() => {
		let ativo = true;
		async function carregar() {
			carregando.value = true;
			erro.value = null;
			try {
				const { data } = await axios.get(`${urlBackend}/questions/ranking`, {
					params: { periodo: aba.value },
					withCredentials: true
				});
				if (ativo) lista.value = data;
			} catch {
				if (ativo) erro.value = 'Não foi possível carregar o ranking.';
			} finally {
				if (ativo) carregando.value = false;
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, [aba.value]);

	const info = PERIODOS.find((p) => p.valor === aba.value) ?? PERIODOS[0];
	const lider = lista.value[0];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box>
				<Typography
					variant="h4"
					component="h1"
				>
					{info.titulo}
				</Typography>
				<Typography color="text.secondary">{info.descricao}</Typography>
			</Box>

			<Card>
				<Tabs
					value={aba.value}
					onChange={(e, v) => (aba.value = v)}
					sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
				>
					{PERIODOS.map((p) => (
						<Tab
							key={p.valor}
							label={p.rotulo}
							value={p.valor}
						/>
					))}
				</Tabs>
			</Card>

			{carregando.value && (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
					<CircularProgress size={32} />
				</Box>
			)}

			{erro.value && <Alert severity="error">{erro.value}</Alert>}

			{!carregando.value && !erro.value && lista.value.length === 0 && (
				<Alert severity="info">Nenhuma questão resolvida neste período.</Alert>
			)}

			{!carregando.value && lista.value.length > 0 && (
				<Card>
					<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						{lista.value.map((p, i) => (
							<Paper
								key={p._id}
								variant="outlined"
								sx={{
									p: 1.75,
									display: 'flex',
									alignItems: 'center',
									gap: 2,
									borderColor: 'divider'
								}}
							>
								<Typography sx={{ width: 32, fontWeight: 800, color: MEDALHAS[i] || 'text.secondary' }}>
									{i + 1}º
								</Typography>
								<Avatar sx={{ bgcolor: i < 3 ? MEDALHAS[i] : 'grey.300', fontSize: 14 }}>
									{gerarIniciais(p.nome)}
								</Avatar>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography
											variant="subtitle2"
											sx={{ fontWeight: 800 }}
											noWrap
										>
											{p.nome}
										</Typography>
										{i === 0 && (
											<EmojiEventsIcon
												fontSize="small"
												sx={{ color: MEDALHAS[0] }}
											/>
										)}
									</Box>
									<LinearProgress
										variant="determinate"
										value={lider ? (p.questoes / lider.questoes) * 100 : 0}
										sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
									/>
								</Box>
								<Box sx={{ textAlign: 'right' }}>
									<Typography
										variant="subtitle2"
										sx={{ fontWeight: 800 }}
									>
										{p.questoes}
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
									>
										questões
									</Typography>
								</Box>
							</Paper>
						))}
					</CardContent>
				</Card>
			)}

			<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
		</Box>
	);
}