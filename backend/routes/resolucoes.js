import express from 'express';
import autenticar from '../api/autenticar.js';
import { criar, listar } from '../controllers/resolucoes.controller.js';
const router = express.Router();

router.get('/questao/:idQuestao', autenticar, listar);
router.post('/', autenticar, criar);

export default router;