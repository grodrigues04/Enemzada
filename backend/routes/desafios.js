import express from 'express';
import autenticar from '../api/autenticar.js';
import { contexto, comecar, concluir } from '../controllers/desafios.controller.js';
const router = express.Router();

router.get('/', autenticar, contexto);
router.post('/comecar', autenticar, comecar);
router.post('/concluir', autenticar, concluir);

export default router;