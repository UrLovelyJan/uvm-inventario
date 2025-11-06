import express from 'express';
import { getLaboratorios } from '../controllers/laboratoriosController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, getLaboratorios);

export default router;