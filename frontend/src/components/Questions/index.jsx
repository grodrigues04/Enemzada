import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AdSlot from '../core/adSlot';
import QuestaoCard from '../core/QuestaoCard';
import { ANOS, AREAS, DIFICULDADES, QUESTOES } from '../../data';

export default function Questions() {
	const [area, setArea] = useState('todas');
	const [ano, setAno] = useState('todos');
	const [dificuldade, setDificuldade] = useState('todas');
	const [busca, setBusca] = useState('');

	const filtradas = useMemo(
		() =>
			QUESTOES.filter(
				(q) =>
					(area === 'todas' || q.area === area) &&
					(ano === 'todos' || q.ano === Number(ano)) &&
					(dificuldade === 'todas' || q.dificuldade === dificuldade) &&
					(busca.trim() === '' || `${q.titulo} ${q.enunciado} ${q.disciplina}`.toLowerCase().includes(busca.toLowerCase()))
			),
		[area, ano, dificuldade, busca]
	);

	const limpar = () => {
		setArea('todas');
		setAno('todos');
		setDificuldade('todas');
		setBusca('');
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box>
				<Typography
					variant="h4"
					component="h1"
				>
					Banco de questões
				</Typography>
				<Typography color="text.secondary">Questões de provas anteriores do ENEM com resoluções escritas pela comunidade.</Typography>
			</Box>

			<Card>
				<CardContent
					sx={{
						display: 'grid',
						gap: 2,
						gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '2fr 1fr 1fr 1fr auto' },
						alignItems: 'center'
					}}
				>
					<TextField
						label="Buscar por tema"
						size="small"
						value={busca}
						onChange={(e) => setBusca(e.target.value)}
					/>
					<TextField
						select
						label="Área"
						size="small"
						value={area}
						onChange={(e) => setArea(e.target.value)}
					>
						<MenuItem value="todas">Todas as áreas</MenuItem>
						{AREAS.map((a) => (
							<MenuItem
								key={a.id}
								value={a.id}
							>
								{a.nome}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="Ano"
						size="small"
						value={ano}
						onChange={(e) => setAno(e.target.value)}
					>
						<MenuItem value="todos">Todos os anos</MenuItem>
						{ANOS.map((a) => (
							<MenuItem
								key={a}
								value={a}
							>
								{a}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="Dificuldade"
						size="small"
						value={dificuldade}
						onChange={(e) => setDificuldade(e.target.value)}
					>
						<MenuItem value="todas">Todas</MenuItem>
						{DIFICULDADES.map((d) => (
							<MenuItem
								key={d}
								value={d}
							>
								{d}
							</MenuItem>
						))}
					</TextField>
					<Button onClick={limpar}>Limpar</Button>
				</CardContent>
			</Card>

			<Typography
				variant="body2"
				color="text.secondary"
			>
				{filtradas.length} questão(ões) encontrada(s)
			</Typography>

			<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 300px' } }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{filtradas.map((q) => (
						<QuestaoCard
							key={q.id}
							questao={q}
							// estado={questoes[q.id]}
						/>
					))}
					{filtradas.length === 0 && (
						<Alert severity="info">Nenhuma questão com esses filtros. Tente ampliar a busca ou limpar os filtros.</Alert>
					)}
				</Box>
				<Box sx={{ display: { xs: 'none', md: 'block' } }}>
					<AdSlot
						formato="vertical"
						titulo="Simulados presenciais na sua cidade"
					/>
				</Box>
			</Box>
		</Box>
	);
}
