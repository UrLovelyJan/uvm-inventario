import express from 'express';
import { getSedes } from '../controllers/sedesController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, getSedes);

export default router;