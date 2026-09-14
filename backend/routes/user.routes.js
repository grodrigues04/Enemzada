import express from 'express';
import { cadastrar, login, me } from '../controllers/user.controller.js';
import autenticar from '../api/autenticar.js';
const router = express.Router();

router.post('/cadastro', cadastrar);
router.get('/login', login);
router.get('/me', autenticar, me);

export default router;
