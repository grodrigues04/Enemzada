import express from 'express';
import autenticar from '../api/autenticar.js';
import { historico, iniciar, detalhar, finalizar } from '../controllers/simulado.controller.js';
const router = express.Router();

router.get('/', autenticar, historico);
router.post('/iniciar', autenticar, iniciar);
router.get('/:id', autenticar, detalhar);
router.post('/:id/finalizar', autenticar, finalizar);

export default router;