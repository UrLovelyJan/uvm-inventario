import express from 'express';
import { getMovimientos, crearMovimiento } from '../controllers/movimientosController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { validateMovimiento } from '../middleware/validation.ts';

const router = express.Router();

router.get('/', authenticateToken, getMovimientos);
router.post('/', authenticateToken, validateMovimiento, crearMovimiento);

export default router;