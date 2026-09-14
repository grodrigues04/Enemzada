import { useEffect } from 'react';
import { useSignals, useSignal } from '@preact/signals-react/runtime';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import user from '../../signals/user';
import AdSlot from '../core/adSlot.jsx';
import { Alternativa } from '../Questions/individualQuestion/Alternativa.jsx';
import { blocosDoContexto, renderMarkdownInline } from '../../utils/enunciado';

const urlBackend = (import.meta.env.VITE_URL_BACKEND ?? import.meta.env.URL_BACKEND ?? '').replace(/\/+$/, '');

const NOME_DISCIPLINA = {
	linguagens: 'Linguagens',
	matematica: 'Matemática',
	'ciencias-humanas': 'Ciências Humanas',
	'ciencias-natureza': 'Ciências da Natureza'
};

function formatarTempo(segundos) {
	const total = Math.max(0, Math.round(segundos ?? 0));
	const min = Math.floor(total / 60);
	const seg = total % 60;
	return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

export default function DesafioDiario() {
	useSignals();
	const etapa = useSignal('carregando');
	const carregando = useSignal(true);
	const erro = useSignal(null);
	const alerta = useSignal(null);
	const contexto = useSignal(null);
	const questoes = useSignal([]);
	const indice = useSignal(0);
	const selecionada = useSignal(null);
	const respostas = useSignal([]);
	const inicio = useSignal(0);
	const resumo = useSignal(null);
	const submetendo = useSignal(false);

	async function carregarContexto() {
		carregando.value = true;
		erro.value = null;
		try {
			const { data } = await axios.get(`${urlBackend}/desafio`, { withCredentials: true });
			contexto.value = data;
			etapa.value = data.concluidoHoje ? 'concluido' : 'intro';
		} catch {
			erro.value = 'Não foi possível carregar o desafio diário. Tente novamente em instantes.';
			etapa.value = 'erro';
		} finally {
			carregando.value = false;
		}
	}

	useEffect(() => {
		if (user.value.autenticado) {
			carregarContexto();
		} else {
			carregando.value = false;
		}
	}, [user.value.autenticado]);

	async function comecar() {
		carregando.value = true;
		erro.value = null;
		try {
			const { data } = await axios.post(`${urlBackend}/desafio/comecar`, {}, { withCredentials: true });
			questoes.value = data.questoes;
			inicio.value = Date.now();
			respostas.value = [];
			indice.value = 0;
			selecionada.value = null;
			resumo.value = null;
			etapa.value = 'jogando';
		} catch (e) {
			if (e.response?.status === 409) {
				const { data } = await axios.get(`${urlBackend}/desafio`, { withCredentials: true });
				contexto.value = data;
				etapa.value = 'concluido';
			} else {
				erro.value = e.response?.data?.mensagem ?? 'Não foi possível iniciar o desafio diário. Tente novamente.';
			}
		} finally {
			carregando.value = false;
		}
	}

	async function responder() {
		const questao = questoes.value[indice.value];
		const resultado = selecionada.value === questao.correctAlternative;
		respostas.value = [
			...respostas.value,
			{ year: questao.year, questionNumber: questao.questionNumber, url: questao.url, result: resultado }
		];

		if (indice.value < questoes.value.length - 1) {
			indice.value += 1;
			selecionada.value = null;
		} else {
			await finalizar();
		}
	}

	async function finalizar() {
		submetendo.value = true;
		const elapsedTime = Math.round((Date.now() - inicio.value) / 1000);
		try {
			const { data } = await axios.post(
				`${urlBackend}/desafio/concluir`,
				{ questions: respostas.value, elapsedTime },
				{ withCredentials: true }
			);
			const acertos = respostas.value.filter((r) => r.result).length;
			resumo.value = { acertos, erros: respostas.value.length - acertos, tempo: elapsedTime, streak_diaria: data.streak_diaria };
			etapa.value = 'resumo';
		} catch (e) {
			alerta.value = e.response?.data?.mensagem ?? 'Não foi possível concluir o desafio diário. Tente novamente.';
			await carregarContexto();
		} finally {
			submetendo.value = false;
		}
	}

	if (!user.value.autenticado) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box>
					<Typography
						variant="h4"
						component="h1"
					>
						Desafio diário
					</Typography>
					<Typography color="text.secondary">Cinco questões selecionadas todos os dias para testar seus conhecimentos.</Typography>
				</Box>

				<Card>
					<CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
						<Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
							<LockOutlinedIcon />
						</Avatar>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800 }}
						>
							Entre para fazer o desafio diário
						</Typography>
						<Typography color="text.secondary">Apenas usuários logados podem participar do desafio diário.</Typography>
					</CardContent>
					<CardActions
						sx={{ justifyContent: 'center', pb: 2.5, gap: 1 }}
					>
						<Button
							component={Link}
							to="/login"
							variant="contained"
						>
							Entrar
						</Button>
						<Button
							component={Link}
							to="/cadastro"
							variant="outlined"
						>
							Criar conta
						</Button>
					</CardActions>
				</Card>

				<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
			</Box>
		);
	}

	if (carregando.value) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
				<CircularProgress size={32} />
			</Box>
		);
	}

	if (etapa.value === 'erro') {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Alert severity="error">{erro.value}</Alert>
				<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
			</Box>
		);
	}

	if (etapa.value === 'jogando') {
		const questao = questoes.value[indice.value];
		const disciplina = NOME_DISCIPLINA[questao?.discipline] ?? questao?.discipline ?? 'Sem disciplina';
		const blocos = blocosDoContexto(questao);

		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box>
					<Typography
						variant="h4"
						component="h1"
					>
						Desafio diário
					</Typography>
					<Typography color="text.secondary">
						Questão {indice.value + 1} de {questoes.value.length}
					</Typography>
				</Box>

				<Card>
					<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
							<Chip
								size="small"
								variant="outlined"
								label={`ENEM ${questao.year}`}
							/>
							<Chip
								size="small"
								variant="outlined"
								label={disciplina}
							/>
						</Box>

						<Typography
							variant="h5"
							component="h1"
						>
							{questao.title}
						</Typography>

						{blocos.map((bloco, indiceBloco) =>
							bloco.tipo === 'imagem' ? (
								<Box
									key={`img-${indiceBloco}`}
									component="img"
									src={bloco.valor}
									alt={`Imagem do enunciado ${indiceBloco + 1}`}
									sx={{ maxWidth: '100%', maxHeight: 320, borderRadius: 1, alignSelf: 'center' }}
								/>
							) : (
								<Typography
									key={`txt-${indiceBloco}`}
									sx={{ lineHeight: 1.75 }}
								>
									{renderMarkdownInline(bloco.valor)}
								</Typography>
							)
						)}

						{questao.alternativesIntroduction && (
							<Typography sx={{ lineHeight: 1.75 }}>{questao.alternativesIntroduction}</Typography>
						)}

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
							{questao.alternatives.map((alt) => (
								<Alternativa
									key={alt.letter}
									alt={alt}
									selecionada={selecionada.value === alt.letter}
									respondida={null}
									correta={questao.correctAlternative}
									onSelect={() => (selecionada.value = alt.letter)}
								/>
							))}
						</Box>

						<Button
							variant="contained"
							size="large"
							disabled={!selecionada.value || submetendo.value}
							onClick={responder}
							sx={{ alignSelf: 'flex-start' }}
						>
							{submetendo.value
								? 'Finalizando...'
								: indice.value < questoes.value.length - 1
									? 'Responder'
									: 'Finalizar desafio'}
						</Button>
					</CardContent>
				</Card>

				<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
			</Box>
		);
	}

	if (etapa.value === 'resumo' && resumo.value) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box>
					<Typography
						variant="h4"
						component="h1"
					>
						Desafio concluído!
					</Typography>
					<Typography color="text.secondary">Esse é o seu desempenho no desafio de hoje.</Typography>
				</Box>

				<Card>
					<CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
						<Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
							<EmojiEventsIcon />
						</Avatar>
						<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', my: 1 }}>
							<Box>
								<Typography
									variant="h4"
									color="success.main"
									sx={{ fontWeight: 800 }}
								>
									{resumo.value.acertos}
								</Typography>
								<Typography color="text.secondary">Acertos</Typography>
							</Box>
							<Box>
								<Typography
									variant="h4"
									color="error.main"
									sx={{ fontWeight: 800 }}
								>
									{resumo.value.erros}
								</Typography>
								<Typography color="text.secondary">Erros</Typography>
							</Box>
							<Box>
								<Typography
									variant="h4"
									sx={{ fontWeight: 800 }}
								>
									{formatarTempo(resumo.value.tempo)}
								</Typography>
								<Typography color="text.secondary">Tempo total</Typography>
							</Box>
						</Box>
						<Chip
							icon={<EmojiEventsIcon />}
							color="secondary"
							variant="outlined"
							label={`${resumo.value.streak_diaria} ${resumo.value.streak_diaria === 1 ? 'dia' : 'dias'} seguidos`}
							sx={{ fontWeight: 700 }}
						/>
					</CardContent>
					<CardActions
						sx={{ justifyContent: 'center', pb: 2.5, gap: 1 }}
					>
						<Button
							component={Link}
							to="/"
							variant="contained"
						>
							Voltar ao início
						</Button>
						<Button
							component={Link}
							to="/questoes"
							variant="outlined"
						>
							Praticar questões
						</Button>
					</CardActions>
				</Card>

				<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />
			</Box>
		);
	}

	const desafio = contexto.value?.desafio ?? {};
	const acertos = desafio.questions?.filter((q) => q.result).length ?? 0;
	const erros = (desafio.questions?.length ?? 0) - acertos;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box>
				<Typography
					variant="h4"
					component="h1"
				>
					Desafio diário
				</Typography>
				<Typography color="text.secondary">Cinco questões selecionadas todos os dias para testar seus conhecimentos.</Typography>
			</Box>

			<Card>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, textAlign: 'center' }}>
					<Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
						<EmojiEventsIcon />
					</Avatar>
					<Typography
						variant="h6"
						sx={{ fontWeight: 800 }}
					>
						{contexto.value?.concluidoHoje ? 'Desafio de hoje já foi concluído' : 'Desafio de hoje'}
					</Typography>

					{contexto.value?.concluidoHoje ? (
						<>
							<Typography color="text.secondary">Você já completou o desafio de hoje. Volte amanhã para um novo desafio.</Typography>
							<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', my: 1 }}>
								<Box>
									<Typography
										variant="h5"
										color="success.main"
										sx={{ fontWeight: 800 }}
									>
										{acertos}
									</Typography>
									<Typography color="text.secondary">Acertos</Typography>
								</Box>
								<Box>
									<Typography
										variant="h5"
										color="error.main"
										sx={{ fontWeight: 800 }}
									>
										{erros}
									</Typography>
									<Typography color="text.secondary">Erros</Typography>
								</Box>
								<Box>
									<Typography
										variant="h5"
										sx={{ fontWeight: 800 }}
									>
										{formatarTempo(desafio.elapsedTime)}
									</Typography>
									<Typography color="text.secondary">Tempo total</Typography>
								</Box>
							</Box>
						</>
					) : (
						<>
							<Typography color="text.secondary">
								Responda 5 questões aleatórias de qualquer edição do ENEM e mantenha sua sequência de dias seguidos.
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start', textAlign: 'left', my: 0.5 }}>
								<Typography variant="body2">• Um desafio por dia</Typography>
								<Typography variant="body2">• Questões nunca se repetem nos seus desafios</Typography>
								<Typography variant="body2">• O tempo é cronometrado em segundo plano</Typography>
							</Box>
						</>
					)}

					<Chip
						icon={<EmojiEventsIcon />}
						color="secondary"
						variant="outlined"
						label={`${contexto.value?.streak_diaria ?? 0} ${(contexto.value?.streak_diaria ?? 0) === 1 ? 'dia' : 'dias'} seguidos`}
						sx={{ fontWeight: 700 }}
					/>
				</CardContent>
				<CardActions
					sx={{ justifyContent: 'center', pb: 2.5, gap: 1 }}
				>
					{contexto.value?.concluidoHoje ? (
						<Button
							component={Link}
							to="/"
							variant="contained"
						>
							Voltar ao início
						</Button>
					) : (
						<Button
							variant="contained"
							size="large"
							startIcon={<PlayArrowIcon />}
							onClick={comecar}
						>
							Começar
						</Button>
					)}
				</CardActions>
			</Card>

			<AdSlot titulo="Anuncie aqui e apoie estudantes de todo o Brasil" />

			<Snackbar
				open={Boolean(alerta.value)}
				autoHideDuration={6000}
				onClose={() => (alerta.value = null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					severity="error"
					onClose={() => (alerta.value = null)}
				>
					{alerta.value}
				</Alert>
			</Snackbar>
		</Box>
	);
}