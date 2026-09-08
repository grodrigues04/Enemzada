import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AdSlot from '../components/AdSlot';
import { buscarQuestao, corArea, nomeArea } from '../data';
import { useApp } from '../store';

function Alternativa({ alt, selecionada, respondida, correta, onSelect }) {
	let cor = 'divider';
	let fundo = 'transparent';
	if (respondida) {
		if (alt.letra === correta) {
			cor = 'success.main';
			fundo = 'success.light';
		} else if (selecionada) {
			cor = 'error.main';
			fundo = 'error.light';
		}
	} else if (selecionada) {
		cor = 'primary.main';
		fundo = 'action.hover';
	}

	return (
		<Paper
			component="button"
			type="button"
			onClick={onSelect}
			disabled={Boolean(respondida)}
			aria-pressed={selecionada}
			variant="outlined"
			sx={{
				p: 2,
				textAlign: 'left',
				width: '100%',
				display: 'flex',
				gap: 1.5,
				alignItems: 'flex-start',
				cursor: respondida ? 'default' : 'pointer',
				borderColor: cor,
				bgcolor: fundo,
				font: 'inherit',
				'&:hover': { borderColor: respondida ? cor : 'primary.main' }
			}}
		>
			<Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: 'primary.main' }}>{alt.letra}</Avatar>
			<Typography
				variant="body2"
				sx={{ pt: 0.35 }}
			>
				{alt.texto}
			</Typography>
		</Paper>
	);
}

export default function Questao({ id }) {
	const questao = buscarQuestao(id);
	const { questoes, responderQuestao, votarResolucao, publicarResolucao, publicarDuvida, responderDuvida } = useApp();
	const [selecionada, setSelecionada] = useState(null);
	const [aba, setAba] = useState(0);
	const [novaResolucao, setNovaResolucao] = useState('');
	const [novaDuvida, setNovaDuvida] = useState('');
	const [respostas, setRespostas] = useState({});

	if (!questao) {
		return (
			<Alert severity="warning">
				Questão não encontrada. <Link to="/questoes">Voltar ao banco de questões</Link>
			</Alert>
		);
	}

	const estado = questoes[questao.id];
	const respondida = estado.respondida;
	const acertou = respondida === questao.correta;
	const resolucoes = [...estado.resolucoes].sort((a, b) => b.votos - a.votos);

	return (
		<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 300px' } }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Card>
					<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
							<Chip
								size="small"
								label={nomeArea(questao.area)}
								sx={{
									bgcolor: `${corArea(questao.area)}1a`,
									color: corArea(questao.area),
									fontWeight: 700
								}}
							/>
							<Chip
								size="small"
								variant="outlined"
								label={`ENEM ${questao.ano}`}
							/>
							<Chip
								size="small"
								variant="outlined"
								label={questao.dificuldade}
							/>
							<Chip
								size="small"
								variant="outlined"
								label={questao.disciplina}
							/>
						</Box>

						<Typography
							variant="h5"
							component="h1"
						>
							{questao.titulo}
						</Typography>
						<Typography sx={{ lineHeight: 1.75 }}>{questao.enunciado}</Typography>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
							{questao.alternativas.map((alt) => (
								<Alternativa
									key={alt.letra}
									alt={alt}
									selecionada={selecionada === alt.letra || respondida === alt.letra}
									respondida={respondida}
									correta={questao.correta}
									onSelect={() => setSelecionada(alt.letra)}
								/>
							))}
						</Box>

						{!respondida ? (
							<Button
								variant="contained"
								size="large"
								disabled={!selecionada}
								onClick={() => responderQuestao(questao.id, selecionada)}
								sx={{ alignSelf: 'flex-start' }}
							>
								Responder
							</Button>
						) : (
							<Alert severity={acertou ? 'success' : 'error'}>
								{acertou
									? 'Boa! Resposta correta. Veja as resoluções para fixar o raciocínio.'
									: `Não foi dessa vez. A alternativa correta é a ${questao.correta}. Confira as resoluções abaixo.`}
							</Alert>
						)}
					</CardContent>
				</Card>

				<Card>
					<Tabs
						value={aba}
						onChange={(e, v) => setAba(v)}
						sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
					>
						<Tab label={`Resoluções (${resolucoes.length})`} />
						<Tab label={`Comentários (${estado.comentarios.length})`} />
					</Tabs>

					{aba === 0 && (
						<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							{resolucoes.map((r, indice) => (
								<Paper
									key={r.id}
									variant="outlined"
									sx={{ p: 2, display: 'flex', gap: 2 }}
								>
									<Box sx={{ textAlign: 'center' }}>
										<Tooltip title={r.meuVoto ? 'Remover voto' : 'Votar nesta resolução'}>
											<IconButton
												color={r.meuVoto ? 'primary' : 'default'}
												onClick={() => votarResolucao(questao.id, r.id)}
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
								value={novaResolucao}
								onChange={(e) => setNovaResolucao(e.target.value)}
							/>
							<Button
								variant="contained"
								sx={{ alignSelf: 'flex-start' }}
								disabled={novaResolucao.trim().length < 10}
								onClick={() => {
									publicarResolucao(questao.id, novaResolucao.trim());
									setNovaResolucao('');
								}}
							>
								Publicar resolução
							</Button>
						</CardContent>
					)}

					{aba === 1 && (
						<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<TextField
								label="Publique sua dúvida sobre esta questão"
								multiline
								minRows={2}
								value={novaDuvida}
								onChange={(e) => setNovaDuvida(e.target.value)}
							/>
							<Button
								variant="contained"
								sx={{ alignSelf: 'flex-start' }}
								disabled={novaDuvida.trim().length < 5}
								onClick={() => {
									publicarDuvida(questao.id, novaDuvida.trim());
									setNovaDuvida('');
								}}
							>
								Enviar dúvida
							</Button>

							{estado.comentarios.length === 0 && (
								<Alert severity="info">Ainda não há dúvidas aqui. Seja a primeira pessoa a perguntar.</Alert>
							)}

							{estado.comentarios.map((c) => (
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
												value={respostas[c.id] || ''}
												onChange={(e) => setRespostas({ ...respostas, [c.id]: e.target.value })}
											/>
											<Button
												disabled={!respostas[c.id] || respostas[c.id].trim().length < 3}
												onClick={() => {
													responderDuvida(questao.id, c.id, respostas[c.id].trim());
													setRespostas({ ...respostas, [c.id]: '' });
												}}
											>
												Responder
											</Button>
										</Box>
									</Box>
								</Paper>
							))}
						</CardContent>
					)}
				</Card>
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
