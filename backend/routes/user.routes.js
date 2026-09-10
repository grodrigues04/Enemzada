import express from 'express';
import { cadastrar, login } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/cadastro', cadastrar);
router.get('/login', login);

export default router;