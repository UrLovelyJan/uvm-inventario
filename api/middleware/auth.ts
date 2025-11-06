import jwt from 'jsonwebtoken';
import pool from '../config/database.ts';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uvm_secret_key');
        
        const [users] = await pool.execute(
            'SELECT u.*, r.nombre as rol_nombre FROM Usuario u JOIN Rol r ON u.rol_id = r.id WHERE u.id = ? AND u.activo = TRUE',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuario no válido' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

export const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol_nombre)) {
            return res.status(403).json({ 
                error: 'No tiene permisos para realizar esta acción' 
            });
        }
        next();
    };
};