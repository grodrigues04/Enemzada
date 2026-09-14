import express from 'express';
import autenticar from '../api/autenticar.js';
import { registrarLog } from '../controllers/questions.controller.js';
import { ranking } from '../controllers/ranking.controller.js';
const router = express.Router();

router.get('/ranking', autenticar, ranking);
router.post('/log', autenticar, registrarLog);

export default router;
