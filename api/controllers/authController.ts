import { AuthService } from '../services/authService.js';

export const login = async (req, res, next) => {
    try {
        const { usuario, contraseña } = req.body;

        if (!usuario || !contraseña) {
            return res.status(400).json({ 
                error: 'Usuario y contraseña son requeridos' 
            });
        }

        const result = await AuthService.login(usuario, contraseña);
        res.json(result);

    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const profile = await AuthService.getProfile(req.user.id);
        res.json(profile);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token requerido' });
        }

        const result = await AuthService.refreshToken(token);
        res.json(result);

    } catch (error) {
        res.status(403).json({ error: error.message });
    }
};