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
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import { corArea, nomeArea } from '../../../data';
import { questoes, responderQuestao } from '../../store';

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
	const imagem = useSignal([]);

	const [ano, indice] = String(id).split('-');

	useEffect(() => {
		let ativo = true;
		async function carregar() {
			carregando.value = true;
			erro.value = null;
			selecionada.value = null;
			try {
				const { data } = await axios.get(`https://api.enem.dev/v1/exams/${ano}/questions/${indice}`);
				console.log('Data fetched:', data); // Debugging line to check the fetched data
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
	imagem.value = questao.value.files;
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
				{}
				{imagem.value.length < 0 && questao.value.context && <Typography sx={{ lineHeight: 1.75 }}>{questao.value.context}</Typography>}
				{imagem.value.length > 0 &&
					imagem.value.map((img, index) => (
						<Box
							key={index}
							component="img"
							src={img}
							alt={`Imagem ${index + 1}`}
							sx={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 1 }}
						/>
					))}
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
						onClick={() => responderQuestao(id, selecionada.value)}
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
			</CardContent>
		</Card>
	);
}
