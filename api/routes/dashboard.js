import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/resumen', authenticateToken, getDashboardData);

export default router;