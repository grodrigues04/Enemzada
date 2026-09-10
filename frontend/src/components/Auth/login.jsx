import { useSignal } from '@preact/signals-react/runtime';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SchoolIcon from '@mui/icons-material/School';

const urlBackend = (import.meta.env.VITE_URL_BACKEND ?? '').replace(/\/+$/, '');

export default function Login() {
	const navigate = useNavigate();
	const location = useLocation();
	const carregando = useSignal(false);
	const erroGeral = useSignal(null);
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm();

	const sucessoCadastro = Boolean(location.state?.cadastroSucesso);

	async function onSubmit(dados) {
		carregando.value = true;
		erroGeral.value = null;
		try {
			await axios.get(`${urlBackend}/usuario/login`, { params: { email: dados.email, senha: dados.senha } });
			navigate('/');
		} catch (erro) {
			const resposta = erro?.response?.data;
			erroGeral.value = resposta?.mensagem ?? 'Não foi possível entrar. Tente novamente.';
		} finally {
			carregando.value = false;
		}
	}

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 2, md: 5 } }}>
			<Card sx={{ width: '100%', maxWidth: 420 }}>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 3, md: 4 } }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
						<SchoolIcon color="primary" />
						<Typography
							variant="h5"
							component="h1"
						>
							Entrar
						</Typography>
					</Box>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Use seu e-mail e senha para continuar seus estudos.
					</Typography>

					{sucessoCadastro && <Alert severity="success">Conta criada com sucesso! Faça login para continuar.</Alert>}
					{erroGeral.value && <Alert severity="error">{erroGeral.value}</Alert>}

					<Box
						component="form"
						onSubmit={handleSubmit(onSubmit)}
						sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
						noValidate
					>
						<TextField
							label="E-mail"
							type="email"
							variant="outlined"
							size="small"
							autoComplete="email"
							{...register('email', {
								required: 'Informe o e-mail.',
								pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido.' }
							})}
							error={!!errors.email}
							helperText={errors.email?.message}
						/>
						<TextField
							label="Senha"
							type="password"
							variant="outlined"
							size="small"
							autoComplete="current-password"
							{...register('senha', { required: 'Informe a senha.' })}
							error={!!errors.senha}
							helperText={errors.senha?.message}
						/>

						<Button
							type="submit"
							variant="contained"
							size="large"
							fullWidth
							disabled={carregando.value}
							startIcon={
								carregando.value ? (
									<CircularProgress
										size={18}
										color="inherit"
									/>
								) : undefined
							}
						>
							{carregando.value ? 'Entrando...' : 'Entrar'}
						</Button>
					</Box>

					<Typography
						variant="body2"
						align="center"
					>
						Ainda não tem conta?{' '}
						<Link
							to="/cadastro"
							style={{ color: 'inherit', fontWeight: 700 }}
						>
							Criar conta
						</Link>
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
