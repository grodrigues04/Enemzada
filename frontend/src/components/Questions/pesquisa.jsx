import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSignal } from '@preact/signals-react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AdSlot from '../core/adSlot';
import QuestaoCard from '../core/QuestaoCard';
import { useSignals } from '@preact/signals-react/runtime';

const ANO_INICIAL = 2009;
const ANO_FINAL = 2023;
const ANOS_DISPONIVEIS = Array.from({ length: ANO_FINAL - ANO_INICIAL + 1 }, (_, i) => ANO_FINAL - i);

const ITENS_POR_PAGINA_OPCOES = [10, 20, 30, 40, 50];

const valoresPadrao = {
	busca: '',
	idioma: 'todas',
	ano: ANO_FINAL,
	itensPorPagina: 10
};

const IDIOMAS = [
	{ valor: 'todas', nome: 'Todos os idiomas' },
	{ valor: 'espanhol', nome: 'Espanhol' }
];

export default function Pesquisa() {
	const { control, handleSubmit, reset, getValues } = useForm({ defaultValues: valoresPadrao });
	useSignals();
	const questoes = useSignal([]);
	const carregando = useSignal(false);
	const erro = useSignal(null);
	const offset = useSignal(0);
	const temMais = useSignal(false);
	const totalEncontrado = useSignal(null);

	const buscarQuestoes = async (dados = valoresPadrao, offsetAtual = 0) => {
		console.log('offsetAtual', offsetAtual);
		carregando.value = true;
		erro.value = null;
		try {
			const { data } = await axios.get(`https://api.enem.dev/v1/exams/${dados.ano}/questions`, {
				params: { limit: dados.itensPorPagina, offset: offsetAtual }
			});
			const resultados = (data?.questions ?? []).map((q) => ({
				id: `${dados.ano}-${q.index}`,
				titulo: `Questão ${q.index}`,
				enunciado: q.alternativesIntroduction ?? q.context ?? '',
				disciplina: q.discipline ?? '',
				idioma: q.language ?? '',
				area: q.discipline,
				ano: dados.ano,
				alternativas: q.alternatives ?? [],
				correta: q.correctAlternative
			}));

			const filtradas = resultados.filter((q) => {
				const porIdioma = dados.idioma === 'todas' || q.idioma === dados.idioma;
				const porBusca =
					!dados.busca.trim() ||
					`${q.titulo} ${q.enunciado} ${q.disciplina}`.toLowerCase().includes(dados.busca.toLowerCase());
				return porIdioma && porBusca;
			});

			questoes.value = offsetAtual === 0 ? filtradas : [...questoes.value, ...filtradas];
			offset.value = offsetAtual + dados.itensPorPagina + 1;
			totalEncontrado.value = data?.metadata?.total ?? null;
			temMais.value = data.metadata.hasMore;
		} catch (e) {
			console.log('Erro ao buscar questões:', e);
			erro.value = 'Não foi possível buscar as questões agora. Tente novamente em instantes.';
		} finally {
			carregando.value = false;
		}
	};

	useEffect(() => {
		buscarQuestoes();
	}, []);

	const onSubmit = (dados) => {
		buscarQuestoes(dados, 0);
	};

	const carregarMais = () => {
		buscarQuestoes(getValues(), offset.value);
	};

	const limpar = () => {
		reset(valoresPadrao);
		questoes.value = [];
		offset.value = 0;
		temMais.value = false;
		totalEncontrado.value = null;
		erro.value = null;
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
					component="form"
					onSubmit={handleSubmit(onSubmit)}
					sx={{
						display: 'grid',
						gap: 2,
						gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '2fr 1fr 1fr 1fr auto auto' },
						alignItems: 'center'
					}}
				>
					<Controller
						name="busca"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Buscar por tema"
								size="small"
							/>
						)}
					/>

					<Controller
						name="idioma"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								select
								label="Idioma"
								size="small"
							>
								{IDIOMAS.map((i) => (
									<MenuItem
										key={i.valor}
										value={i.valor}
									>
										{i.nome}
									</MenuItem>
								))}
							</TextField>
						)}
					/>

					<Controller
						name="ano"
						control={control}
						rules={{ required: true }}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								select
								label="Ano"
								size="small"
								error={!!fieldState.error}
								helperText={fieldState.error ? 'Selecione um ano' : ''}
							>
								{ANOS_DISPONIVEIS.map((a) => (
									<MenuItem
										key={a}
										value={a}
									>
										{a}
									</MenuItem>
								))}
							</TextField>
						)}
					/>

					<Controller
						name="itensPorPagina"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								select
								label="Itens por página"
								size="small"
							>
								{ITENS_POR_PAGINA_OPCOES.map((valor) => (
									<MenuItem
										key={valor}
										value={valor}
									>
										{valor}
									</MenuItem>
								))}
							</TextField>
						)}
					/>

					<Button
						type="submit"
						variant="contained"
						disabled={carregando.value}
					>
						{carregando.value ? 'Buscando...' : 'Pesquisar'}
					</Button>
					<Button
						type="button"
						onClick={limpar}
						disabled={carregando.value}
					>
						Limpar
					</Button>
				</CardContent>
			</Card>

			{erro.value && <Alert severity="error">{erro.value}</Alert>}

			<Typography
				variant="body2"
				color="text.secondary"
			>
				{questoes.value.length} questão(ões) encontrada(s)
				{totalEncontrado.value ? ` de ${totalEncontrado.value} no total` : ''}
			</Typography>

			<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 300px' } }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{questoes.value.map((q) => (
						<QuestaoCard
							key={q.id}
							questao={q}
						/>
					))}

					{!carregando.value && questoes.value.length === 0 && (
						<Alert severity="info">Nenhuma questão encontrada. Selecione um ano e clique em pesquisar.</Alert>
					)}

					{carregando.value && (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
							<CircularProgress size={28} />
						</Box>
					)}

					{!carregando.value && temMais.value && (
						<Button
							variant="outlined"
							onClick={carregarMais}
						>
							Carregar mais
						</Button>
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
