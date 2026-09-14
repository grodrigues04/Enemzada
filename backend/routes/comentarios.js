import express from 'express';
import autenticar from '../api/autenticar.js';
import { criar, listar, listarDaResolucao, comentarNaResolucao, responderComentario } from '../controllers/comentarios.controller.js';
const router = express.Router();

router.get('/questao/:idQuestao', autenticar, listar);
router.get('/resolucao/:id', autenticar, listarDaResolucao);
router.post('/', autenticar, criar);
router.post('/resolucao/:id', autenticar, comentarNaResolucao);
router.post('/:id/respostas', autenticar, responderComentario);

export default router;