import express from 'express';
import { getEquipos, getEquipoById } from '../controllers/equiposController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, getEquipos);
router.get('/:id', authenticateToken, getEquipoById);

export default router;