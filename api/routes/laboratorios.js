import express from 'express';
import { getLaboratorios } from '../controllers/laboratoriosController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getLaboratorios);

export default router;