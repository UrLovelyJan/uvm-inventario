import express from 'express';
import { getSedes } from '../controllers/sedesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getSedes);

export default router;