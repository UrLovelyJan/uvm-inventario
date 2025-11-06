import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.ts';

export class AuthService {
    /**
     * Autentica un usuario con credenciales
     * @param {string} usuario - Nombre de usuario
     * @param {string} contraseña - Contraseña sin encriptar
     * @returns {Promise<Object>} Datos del usuario y token
     */
    static async login(usuario, contraseña) {
        try {
            // Buscar usuario activo
            const [users] = await pool.execute(
                `SELECT u.*, r.nombre as rol_nombre, r.descripcion as rol_descripcion
                 FROM Usuario u 
                 JOIN Rol r ON u.rol_id = r.id 
                 WHERE u.usuario = ? AND u.activo = TRUE`,
                [usuario]
            );

            if (users.length === 0) {
                throw new Error('Credenciales inválidas');
            }

            const user = users[0];

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(contraseña, user.contraseña_hash);
            if (!isValidPassword) {
                throw new Error('Credenciales inválidas');
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    rol: user.rol_nombre,
                    usuario: user.usuario
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Eliminar información sensible
            const { contraseña_hash, ...userWithoutPassword } = user;

            return {
                token,
                user: userWithoutPassword,
                expiresIn: '24h'
            };

        } catch (error) {
            throw new Error(`Error en autenticación: ${error.message}`);
        }
    }

    /**
     * Verifica y decodifica un token JWT
     * @param {string} token - Token JWT
     * @returns {Promise<Object>} Datos del usuario decodificados
     */
    static async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verificar que el usuario aún existe y está activo
            const [users] = await pool.execnute(
                'SELECT u.*, r.nombre as rol_nombre FROM Usuario u JOIN Rol r ON u.rol_id = r.id WHERE u.id = ? AND u.activo = TRUE',
                [decoded.userId]
            );

            if (users.length === 0) {
                throw new Error('Usuario no encontrado o inactivo');
            }

            const user = users[0];
            const { contraseña_hash, ...userWithoutPassword } = user;

            return userWithoutPassword;

        } catch (error) {
            throw new Error(`Token inválido: ${error.message}`);
        }
    }

    /**
     * Refresca un token JWT
     * @param {string} token - Token actual
     * @returns {Promise<Object>} Nuevo token
     */
    static async refreshToken(token) {
        try {
            const user = await this.verifyToken(token);
            
            // Generar nuevo token
            const newToken = jwt.sign(
                { 
                    userId: user.id, 
                    rol: user.rol_nombre,
                    usuario: user.usuario
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return {
                token: newToken,
                user,
                expiresIn: '24h'
            };

        } catch (error) {
            throw new Error(`Error refrescando token: ${error.message}`);
        }
    }

    /**
     * Cambia la contraseña de un usuario
     * @param {number} userId - ID del usuario
     * @param {string} currentPassword - Contraseña actual
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<boolean>} True si fue exitoso
     */
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            // Verificar contraseña actual
            const [users] = await pool.execute(
                'SELECT contraseña_hash FROM Usuario WHERE id = ? AND activo = TRUE',
                [userId]
            );

            if (users.length === 0) {
                throw new Error('Usuario no encontrado');
            }

            const user = users[0];
            const isValidPassword = await bcrypt.compare(currentPassword, user.contraseña_hash);
            
            if (!isValidPassword) {
                throw new Error('Contraseña actual incorrecta');
            }

            // Hashear nueva contraseña
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Actualizar contraseña
            await pool.execute(
                'UPDATE Usuario SET contraseña_hash = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?',
                [newPasswordHash, userId]
            );

            return true;

        } catch (error) {
            throw new Error(`Error cambiando contraseña: ${error.message}`);
        }
    }

    /**
     * Crea un nuevo usuario (solo para Jefes)
     * @param {Object} userData - Datos del nuevo usuario
     * @param {number} creatorId - ID del usuario creador
     * @returns {Promise<Object>} Usuario creado
     */
    static async createUser(userData, creatorId) {
        try {
            const { usuario, contraseña, nombre, email, rol_id } = userData;

            // Verificar que el usuario no exista
            const [existingUsers] = await pool.execute(
                'SELECT id FROM Usuario WHERE usuario = ?',
                [usuario]
            );

            if (existingUsers.length > 0) {
                throw new Error('El usuario ya existe');
            }

            // Hashear contraseña
            const saltRounds = 12;
            const contraseñaHash = await bcrypt.hash(contraseña, saltRounds);

            // Insertar nuevo usuario
            const [result] = await pool.execute(
                `INSERT INTO Usuario (usuario, contraseña_hash, rol_id, nombre, email, creado_por) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [usuario, contraseñaHash, rol_id, nombre, email, creatorId]
            );

            // Obtener usuario creado
            const [newUsers] = await pool.execute(
                `SELECT u.*, r.nombre as rol_nombre 
                 FROM Usuario u 
                 JOIN Rol r ON u.rol_id = r.id 
                 WHERE u.id = ?`,
                [result.insertId]
            );

            const newUser = newUsers[0];
            const { contraseña_hash, ...userWithoutPassword } = newUser;

            return userWithoutPassword;

        } catch (error) {
            throw new Error(`Error creando usuario: ${error.message}`);
        }
    }

    /**
     * Obtiene el perfil completo de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} Perfil del usuario
     */
    static async getProfile(userId) {
        try {
            const [users] = await pool.execute(
                `SELECT u.*, r.nombre as rol_nombre, r.descripcion as rol_descripcion
                 FROM Usuario u 
                 JOIN Rol r ON u.rol_id = r.id 
                 WHERE u.id = ?`,
                [userId]
            );

            if (users.length === 0) {
                throw new Error('Usuario no encontrado');
            }

            const user = users[0];
            const { contraseña_hash, ...userWithoutPassword } = user;

            // Obtener estadísticas del usuario
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(DISTINCT m.id) as total_movimientos,
                    COUNT(DISTINCT h.id) as total_historial,
                    MAX(m.creado_en) as ultimo_movimiento
                FROM Usuario u
                LEFT JOIN Movimiento m ON u.id = m.usuario_id
                LEFT JOIN Historial h ON u.id = h.usuario_id
                WHERE u.id = ?
                GROUP BY u.id
            `, [userId]);

            return {
                ...userWithoutPassword,
                estadisticas: stats[0] || {}
            };

        } catch (error) {
            throw new Error(`Error obteniendo perfil: ${error.message}`);
        }
    }
}

export default AuthService;