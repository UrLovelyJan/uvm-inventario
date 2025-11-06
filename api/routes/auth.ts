import express from 'express';
import { login, getProfile } from '../controllers/authController.ts';
import { validateLogin } from '../middleware/validation.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = express.Router();

router.post('/login', validateLogin, login);
router.get('/profile', authenticateToken, getProfile);

export default router;