import express from 'express';
import { getEquipos, getEquipoById } from '../controllers/equiposController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getEquipos);
router.get('/:id', authenticateToken, getEquipoById);

export default router;