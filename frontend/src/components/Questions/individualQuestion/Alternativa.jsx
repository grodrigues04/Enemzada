import { useEffect } from 'react';
import { useSignals, useSignal } from '@preact/signals-react/runtime';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import { corArea, nomeArea } from '../../../data';
import { questoes, responderQuestao, alertaResposta } from '../../store';

const AREA_POR_DISCIPLINA = {
	linguagens: 'linguagens',
	matematica: 'matematica',
	'ciencias-humanas': 'humanas',
	'ciencias-natureza': 'natureza'
};

const NOME_POR_DISCIPLINA = {
	linguagens: 'Linguagens',
	matematica: 'Matemática',
	'ciencias-humanas': 'Ciências Humanas',
	'ciencias-natureza': 'Ciências da Natureza'
};

function resolverImagem(url, arquivos, ano, indice) {
	if (/^https?:\/\//.test(url)) return url;
	const nome = url.split('/').pop();
	const correspondente = arquivos?.find((f) => f.endsWith(`/${nome}`) || f === url);
	if (correspondente) return correspondente;
	return `https://enem.dev/${ano}/questions/${indice}/${nome}`;
}

function renderMarkdownInline(texto) {
	const partes = [];
	const regex = /(\*\*[^*]+\*\*)|(^|[^A-Za-z0-9À-ÿ])(_([^_]+)_)(?=$|[^A-Za-z0-9À-ÿ])/g;
	let restante = texto;
	let m;
	let chave = 0;
	regex.lastIndex = 0;
	while ((m = regex.exec(restante))) {
		if (m.index > 0) partes.push(restante.slice(0, m.index));
		if (m[1] !== undefined) {
			partes.push(<strong key={`n${chave++}`}>{m[1].slice(2, -2)}</strong>);
			restante = restante.slice(m.index + m[1].length);
		} else {
			if (m[2]) partes.push(m[2]);
			partes.push(<em key={`i${chave++}`}>{m[4]}</em>);
			restante = restante.slice(m.index + m[0].length);
		}
		regex.lastIndex = 0;
	}
	if (restante) partes.push(restante);
	return partes;
}

function blocosDoContexto(questao) {
	const { context, files, year: ano, index } = questao;
	const blocos = [];
	const regexImagem = /!\[[^\]]*\]\(([^)]+)\)/g;
	let restante = context?.trim();
	let m;
	regexImagem.lastIndex = 0;
	while (restante && (m = regexImagem.exec(restante))) {
		if (m.index > 0) blocos.push({ tipo: 'texto', valor: restante.slice(0, m.index) });
		blocos.push({ tipo: 'imagem', valor: resolverImagem(m[1], files, ano, index) });
		restante = restante.slice(m.index + m[0].length);
		regexImagem.lastIndex = 0;
	}
	if (restante?.trim()) blocos.push({ tipo: 'texto', valor: restante });

	const usadas = new Set(blocos.filter((b) => b.tipo === 'imagem').map((b) => b.valor));
	(files ?? []).forEach((f) => {
		if (!usadas.has(f)) blocos.push({ tipo: 'imagem', valor: f });
	});

	return blocos;
}

function Alternativa({ alt, selecionada, respondida, correta, onSelect }) {
	let cor = 'divider';
	let fundo = 'transparent';
	if (respondida) {
		if (alt.letter === correta) {
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
			<Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: 'primary.main' }}>{alt.letter}</Avatar>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
				{alt.text && (
					<Typography
						variant="body2"
						sx={{ pt: 0.35 }}
					>
						{alt.text}
					</Typography>
				)}
				{alt.file && (
					<Box
						component="img"
						src={alt.file}
						alt={`Alternativa ${alt.letter}`}
						sx={{ maxWidth: '100%', maxHeight: 300, borderRadius: 1 }}
					/>
				)}
			</Box>
		</Paper>
	);
}

export default function Alternativas({ id }) {
	useSignals();
	const questao = useSignal(null);
	const carregando = useSignal(true);
	const erro = useSignal(null);
	const selecionada = useSignal(null);

	const [ano, indice] = String(id).split('-');

	useEffect(() => {
		let ativo = true;
		async function carregar() {
			carregando.value = true;
			erro.value = null;
			selecionada.value = null;
			try {
				const { data } = await axios.get(`https://api.enem.dev/v1/exams/${ano}/questions/${indice}`);
				if (ativo) questao.value = data;
			} catch {
				if (ativo) erro.value = 'Não foi possível carregar esta questão. Tente novamente em instantes.';
			} finally {
				if (ativo) carregando.value = false;
			}
		}
		carregar();
		return () => {
			ativo = false;
		};
	}, [ano, indice]);

	if (carregando.value) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
				<CircularProgress size={32} />
			</Box>
		);
	}

	if (erro.value || !questao.value) {
		return <Alert severity="error">{erro.value ?? 'Questão não encontrada.'}</Alert>;
	}

	const area = AREA_POR_DISCIPLINA[questao.value.discipline];
	const disciplina = NOME_POR_DISCIPLINA[questao.value.discipline] ?? questao.value.discipline ?? 'Sem disciplina';
	const respondida = questoes.value[id]?.respondida;
	const acertou = respondida === questao.value.correctAlternative;
	const blocos = blocosDoContexto(questao.value);
	return (
		<Card>
			<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
					{area && (
						<Chip
							size="small"
							label={nomeArea(area)}
							sx={{
								bgcolor: `${corArea(area)}1a`,
								color: corArea(area),
								fontWeight: 700
							}}
						/>
					)}
					<Chip
						size="small"
						variant="outlined"
						label={`ENEM ${questao.value.year}`}
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
					{questao.value.title}
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

				{questao.value.alternativesIntroduction && (
					<Typography sx={{ lineHeight: 1.75 }}>{questao.value.alternativesIntroduction}</Typography>
				)}

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
					{questao.value.alternatives.map((alt) => (
						<Alternativa
							key={alt.letter}
							alt={alt}
							selecionada={selecionada.value === alt.letter || respondida === alt.letter}
							respondida={respondida}
							correta={questao.value.correctAlternative}
							onSelect={() => (selecionada.value = alt.letter)}
						/>
					))}
				</Box>

				{!respondida ? (
					<Button
						variant="contained"
						size="large"
						disabled={!selecionada.value}
						onClick={() => responderQuestao(id, selecionada.value, selecionada.value === questao.value.correctAlternative)}
						sx={{ alignSelf: 'flex-start' }}
					>
						Responder
					</Button>
				) : (
					<Alert severity={acertou ? 'success' : 'error'}>
						{acertou
							? 'Boa! Resposta correta. Veja as resoluções para fixar o raciocínio.'
							: `Não foi dessa vez. A alternativa correta é a ${questao.value.correctAlternative}. Confira as resoluções abaixo.`}
					</Alert>
				)}

				<Snackbar
					open={Boolean(alertaResposta.value)}
					autoHideDuration={5000}
					onClose={() => (alertaResposta.value = null)}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				>
					<Alert
						severity="warning"
						onClose={() => (alertaResposta.value = null)}
					>
						{alertaResposta.value}
					</Alert>
				</Snackbar>
			</CardContent>
		</Card>
	);
}
