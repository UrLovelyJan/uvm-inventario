import express from 'express';
import { getHistorial } from '../controllers/historialController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getHistorial);

export default router;