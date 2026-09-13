import express from 'express';
import autenticar from '../api/autenticar.js';
import { ranking } from '../controllers/questions.controller.js';
const router = express.Router();

router.get('/ranking', autenticar, ranking);

export default router;
