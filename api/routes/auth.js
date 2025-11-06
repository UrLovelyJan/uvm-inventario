import express from 'express';
import { login, getProfile } from '../controllers/authController.js';
import { validateLogin } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.get('/profile', authenticateToken, getProfile);

export default router;