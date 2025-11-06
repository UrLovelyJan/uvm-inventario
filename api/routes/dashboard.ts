import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/resumen', authenticateToken, getDashboardData);

export default router;