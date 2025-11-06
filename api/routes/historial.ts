import express from 'express';
import { getHistorial } from '../controllers/historialController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, getHistorial);

export default router;