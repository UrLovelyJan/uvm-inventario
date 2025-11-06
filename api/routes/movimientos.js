import express from 'express';
import { getMovimientos, crearMovimiento } from '../controllers/movimientosController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateMovimiento } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, getMovimientos);
router.post('/', authenticateToken, validateMovimiento, crearMovimiento);

export default router;