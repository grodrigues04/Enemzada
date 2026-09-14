import { useSignal } from '@preact/signals-react/runtime';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
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

const urlBackend = (import.meta.env.VITE_URL_BACKEND ?? import.meta.env.URL_BACKEND ?? '').replace(/\/+$/, '');
console.log('urlBackend:', urlBackend);
function formatarCpf(valor) {
	const digitos = valor.replace(/\D/g, '').slice(0, 11);
	let formatado = digitos;
	if (digitos.length > 9) {
		formatado = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
	} else if (digitos.length > 6) {
		formatado = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
	} else if (digitos.length > 3) {
		formatado = `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
	}
	return formatado;
}

function cpfValido(valor) {
	const digitos = valor.replace(/\D/g, '');

	if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
		return false;
	}

	function digitoVerificador(base) {
		let soma = 0;
		for (let i = 0; i < base.length; i += 1) {
			soma += Number(base[i]) * (base.length + 1 - i);
		}
		const resto = (soma * 10) % 11;
		return resto === 10 ? 0 : resto;
	}

	return (
		digitoVerificador(digitos.slice(0, 9)) === Number(digitos[9]) &&
		digitoVerificador(digitos.slice(0, 10)) === Number(digitos[10])
	);
}

export default function Cadastro() {
	const navigate = useNavigate();
	const carregando = useSignal(false);
	const erroGeral = useSignal(null);
	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		setError,
		formState: { errors }
	} = useForm();

	async function onSubmit(dados) {
		carregando.value = true;
		erroGeral.value = null;
		try {
			await axios.post(`${urlBackend}/usuario/cadastro`, dados);
			navigate('/login', { state: { cadastroSucesso: true } });
		} catch (erro) {
			const resposta = erro?.response?.data;
			if (resposta?.campos) {
				for (const [campo, mensagem] of Object.entries(resposta.campos)) {
					setError(campo, { type: 'server', message: mensagem });
				}
			} else {
				erroGeral.value = resposta?.mensagem ?? 'Não foi possível concluir o cadastro. Tente novamente.';
			}
		} finally {
			carregando.value = false;
		}
	}

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 2, md: 5 } }}>
			<Card sx={{ width: '100%', maxWidth: 480 }}>
				<CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 3, md: 4 } }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
						<SchoolIcon color="primary" />
						<Typography
							variant="h5"
							component="h1"
						>
							Criar conta
						</Typography>
					</Box>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Crie sua conta gratuita para acompanhar seus estudos no ENEM.
					</Typography>

					{erroGeral.value && <Alert severity="error">{erroGeral.value}</Alert>}

					<Box
						component="form"
						onSubmit={handleSubmit(onSubmit)}
						sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
						noValidate
					>
						<TextField
							label="Nome completo"
							variant="outlined"
							size="small"
							autoComplete="name"
							{...register('nomeCompleto', {
								required: 'Informe o nome completo.',
								minLength: { value: 3, message: 'Nome muito curto.' },
								validate: (valor) => valor.trim().split(/\s+/).length >= 2 || 'Informe nome e sobrenome.'
							})}
							error={!!errors.nomeCompleto}
							helperText={errors.nomeCompleto?.message}
						/>
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
							label="CPF"
							variant="outlined"
							size="small"
							autoComplete="off"
							{...register('cpf', {
								required: 'Informe o CPF.',
								minLength: { value: 14, message: 'CPF incompleto.' },
								validate: (valor) => cpfValido(valor) || 'CPF inválido.'
							})}
							onChange={(e) => setValue('cpf', formatarCpf(e.target.value))}
							error={!!errors.cpf}
							helperText={errors.cpf?.message}
							inputProps={{ inputMode: 'numeric' }}
						/>
						<TextField
							label="Data de nascimento"
							type="date"
							variant="outlined"
							size="small"
							slotProps={{ inputLabel: { shrink: true } }}
							{...register('dataNascimento', { required: 'Informe a data de nascimento.' })}
							error={!!errors.dataNascimento}
							helperText={errors.dataNascimento?.message}
						/>
						<TextField
							label="Senha"
							type="password"
							variant="outlined"
							size="small"
							autoComplete="new-password"
							{...register('senha', {
								required: 'Informe a senha.',
								minLength: { value: 6, message: 'A senha precisa ter ao menos 6 caracteres.' }
							})}
							error={!!errors.senha}
							helperText={errors.senha?.message}
						/>
						<TextField
							label="Confirmação de senha"
							type="password"
							variant="outlined"
							size="small"
							autoComplete="new-password"
							{...register('confirmacaoSenha', {
								required: 'Confirme a senha.',
								validate: (valor) => valor === getValues('senha') || 'As senhas não coincidem.'
							})}
							error={!!errors.confirmacaoSenha}
							helperText={errors.confirmacaoSenha?.message}
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
							{carregando.value ? 'Criando conta...' : 'Criar conta'}
						</Button>
					</Box>

					<Typography
						variant="body2"
						align="center"
					>
						Já tem uma conta?{' '}
						<Link
							to="/login"
							style={{ color: 'inherit', fontWeight: 700 }}
						>
							Entrar
						</Link>
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
