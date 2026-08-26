import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ForumIcon from '@mui/icons-material/Forum';
import { corArea, nomeArea } from '../../data';

export default function QuestionCard({ questao, estado }) {
	const respondida = estado && estado.respondida;
	const totalComentarios = estado ? estado.comentarios.length : 0;
	const totalResolucoes = estado ? estado.resolucoes.length : 0;

	return (
		<Card>
			<CardActionArea
				to="/questoes/$id"
				params={{ id: questao.id }}
			>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
						<Chip
							size="small"
							label={nomeArea(questao.area)}
							sx={{ bgcolor: `${corArea(questao.area)}1a`, color: corArea(questao.area), fontWeight: 700 }}
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
						{respondida && (
							<Chip
								size="small"
								color={respondida === questao.correta ? 'success' : 'error'}
								icon={<CheckCircleIcon />}
								label={respondida === questao.correta ? 'Acertou' : 'Errou'}
							/>
						)}
					</Box>

					<Typography
						variant="subtitle1"
						sx={{ fontWeight: 800 }}
					>
						{questao.titulo}
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
					>
						{questao.enunciado}
					</Typography>

					<Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', alignItems: 'center' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<ForumIcon fontSize="inherit" />
							<Typography variant="caption">
								{totalResolucoes} resoluções · {totalComentarios} dúvidas
							</Typography>
						</Box>
					</Box>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}
