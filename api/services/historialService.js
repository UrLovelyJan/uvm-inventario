import pool from '../config/database.js';

export class HistorialService {
    /**
     * Obtiene todo el historial del sistema
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Array>} Lista de registros de historial
     */
    static async getAllHistorial(filters = {}) {
        try {
            let query = `
                SELECT h.*, 
                       e.modelo as equipo_nombre,
                       e.codigo_inventario,
                       l.nombre as laboratorio_nombre,
                       u.nombre as usuario_nombre,
                       s.nombre as sede_nombre
                FROM Historial h
                LEFT JOIN Equipo e ON h.equipo_id = e.id
                LEFT JOIN Laboratorio l ON h.laboratorio_id = l.id
                LEFT JOIN Sede s ON l.sede_id = s.id
                JOIN Usuario u ON h.usuario_id = u.id
                WHERE 1=1
            `;
            
            const params = [];

            // Aplicar filtros
            if (filters.accion) {
                query += ' AND h.accion = ?';
                params.push(filters.accion);
            }

            if (filters.equipo_id) {
                query += ' AND h.equipo_id = ?';
                params.push(filters.equipo_id);
            }

            if (filters.laboratorio_id) {
                query += ' AND h.laboratorio_id = ?';
                params.push(filters.laboratorio_id);
            }

            if (filters.usuario_id) {
                query += ' AND h.usuario_id = ?';
                params.push(filters.usuario_id);
            }

            if (filters.fecha_desde) {
                query += ' AND DATE(h.creado_en) >= ?';
                params.push(filters.fecha_desde);
            }

            if (filters.fecha_hasta) {
                query += ' AND DATE(h.creado_en) <= ?';
                params.push(filters.fecha_hasta);
            }

            if (filters.search) {
                query += ' AND (e.modelo LIKE ? OR e.codigo_inventario LIKE ? OR h.detalle LIKE ? OR u.nombre LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY h.creado_en DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            const [historial] = await pool.execute(query, params);

            return historial;

        } catch (error) {
            throw new Error(`Error obteniendo historial: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas del historial
     * @returns {Promise<Object>} Estadísticas del historial
     */
    static async getEstadisticasHistorial() {
        try {
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_registros,
                    COUNT(DISTINCT equipo_id) as equipos_afectados,
                    COUNT(DISTINCT usuario_id) as usuarios_activos,
                    COUNT(DISTINCT laboratorio_id) as laboratorios_afectados,
                    COUNT(CASE WHEN accion = 'ALTA' THEN 1 END) as altas,
                    COUNT(CASE WHEN accion = 'BAJA' THEN 1 END) as bajas,
                    COUNT(CASE WHEN accion = 'MOVIMIENTO' THEN 1 END) as movimientos,
                    COUNT(CASE WHEN accion = 'ACTUALIZACION' THEN 1 END) as actualizaciones,
                    MAX(creado_en) as ultimo_registro
                FROM Historial
            `);

            // Historial por día (últimos 30 días)
            const [porDia] = await pool.execute(`
                SELECT 
                    DATE(creado_en) as fecha,
                    COUNT(*) as total,
                    COUNT(CASE WHEN accion = 'ALTA' THEN 1 END) as altas,
                    COUNT(CASE WHEN accion = 'BAJA' THEN 1 END) as bajas,
                    COUNT(CASE WHEN accion = 'MOVIMIENTO' THEN 1 END) as movimientos,
                    COUNT(CASE WHEN accion = 'ACTUALIZACION' THEN 1 END) as actualizaciones
                FROM Historial
                WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(creado_en)
                ORDER BY fecha DESC
            `);

            // Usuarios más activos
            const [usuariosActivos] = await pool.execute(`
                SELECT 
                    u.nombre,
                    u.usuario,
                    COUNT(*) as total_acciones,
                    COUNT(CASE WHEN h.accion = 'MOVIMIENTO' THEN 1 END) as movimientos,
                    COUNT(CASE WHEN h.accion = 'ACTUALIZACION' THEN 1 END) as actualizaciones
                FROM Historial h
                JOIN Usuario u ON h.usuario_id = u.id
                WHERE h.creado_en >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY h.usuario_id, u.nombre, u.usuario
                ORDER BY total_acciones DESC
                LIMIT 10
            `);

            return {
                general: stats[0] || {},
                porDia: porDia || [],
                usuariosActivos: usuariosActivos || []
            };

        } catch (error) {
            throw new Error(`Error obteniendo estadísticas: ${error.message}`);
        }
    }

    /**
     * Obtiene el historial de un equipo específico
     * @param {number} equipoId - ID del equipo
     * @returns {Promise<Array>} Historial del equipo
     */
    static async getHistorialPorEquipo(equipoId) {
        try {
            const [historial] = await pool.execute(`
                SELECT h.*,
                       l.nombre as laboratorio_nombre,
                       u.nombre as usuario_nombre,
                       TIMESTAMPDIFF(HOUR, h.creado_en, NOW()) as horas_desde
                FROM Historial h
                LEFT JOIN Laboratorio l ON h.laboratorio_id = l.id
                JOIN Usuario u ON h.usuario_id = u.id
                WHERE h.equipo_id = ?
                ORDER BY h.creado_en DESC
                LIMIT 100
            `, [equipoId]);

            return historial;

        } catch (error) {
            throw new Error(`Error obteniendo historial del equipo: ${error.message}`);
        }
    }

    /**
     * Obtiene el historial de un laboratorio específico
     * @param {number} laboratorioId - ID del laboratorio
     * @returns {Promise<Array>} Historial del laboratorio
     */
    static async getHistorialPorLaboratorio(laboratorioId) {
        try {
            const [historial] = await pool.execute(`
                SELECT h.*,
                       e.modelo as equipo_nombre,
                       e.codigo_inventario,
                       u.nombre as usuario_nombre,
                       TIMESTAMPDIFF(HOUR, h.creado_en, NOW()) as horas_desde
                FROM Historial h
                JOIN Equipo e ON h.equipo_id = e.id
                JOIN Usuario u ON h.usuario_id = u.id
                WHERE h.laboratorio_id = ?
                ORDER BY h.creado_en DESC
                LIMIT 100
            `, [laboratorioId]);

            return historial;

        } catch (error) {
            throw new Error(`Error obteniendo historial del laboratorio: ${error.message}`);
        }
    }

    /**
     * Registra una nueva entrada en el historial
     * @param {Object} historialData - Datos del historial
     * @returns {Promise<Object>} Registro creado
     */
    static async registrarHistorial(historialData) {
        try {
            const { equipo_id, laboratorio_id, accion, detalle, usuario_id } = historialData;

            const [result] = await pool.execute(
                `INSERT INTO Historial (equipo_id, laboratorio_id, accion, detalle, usuario_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [equipo_id, laboratorio_id, accion, detalle, usuario_id]
            );

            // Obtener registro creado
            const [nuevoRegistro] = await pool.execute(`
                SELECT h.*,
                       e.modelo as equipo_nombre,
                       l.nombre as laboratorio_nombre,
                       u.nombre as usuario_nombre
                FROM Historial h
                LEFT JOIN Equipo e ON h.equipo_id = e.id
                LEFT JOIN Laboratorio l ON h.laboratorio_id = l.id
                JOIN Usuario u ON h.usuario_id = u.id
                WHERE h.id = ?
            `, [result.insertId]);

            return nuevoRegistro[0];

        } catch (error) {
            throw new Error(`Error registrando historial: ${error.message}`);
        }
    }

    /**
     * Obtiene actividades recientes del sistema
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} Actividades recientes
     */
    static async getActividadesRecientes(limit = 50) {
        try {
            const [actividades] = await pool.execute(`
                SELECT 
                    h.*,
                    e.modelo as equipo_nombre,
                    e.codigo_inventario,
                    l.nombre as laboratorio_nombre,
                    u.nombre as usuario_nombre,
                    TIMESTAMPDIFF(MINUTE, h.creado_en, NOW()) as minutos_desde,
                    CASE 
                        WHEN TIMESTAMPDIFF(MINUTE, h.creado_en, NOW()) < 60 THEN 'RECIENTE'
                        WHEN TIMESTAMPDIFF(HOUR, h.creado_en, NOW()) < 24 THEN 'HOY'
                        ELSE 'ANTERIOR'
                    END as tipo_tiempo
                FROM Historial h
                LEFT JOIN Equipo e ON h.equipo_id = e.id
                LEFT JOIN Laboratorio l ON h.laboratorio_id = l.id
                JOIN Usuario u ON h.usuario_id = u.id
                ORDER BY h.creado_en DESC
                LIMIT ?
            `, [limit]);

            return actividades;

        } catch (error) {
            throw new Error(`Error obteniendo actividades recientes: ${error.message}`);
        }
    }

    /**
     * Obtiene el resumen de actividades por tipo
     * @returns {Promise<Object>} Resumen por tipo de actividad
     */
    static async getResumenPorTipo() {
        try {
            const [resumen] = await pool.execute(`
                SELECT 
                    accion,
                    COUNT(*) as total,
                    COUNT(DISTINCT equipo_id) as equipos_unicos,
                    COUNT(DISTINCT usuario_id) as usuarios_unicos,
                    MAX(creado_en) as ultima_actividad
                FROM Historial
                WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY accion
                ORDER BY total DESC
            `);

            return resumen;

        } catch (error) {
            throw new Error(`Error obteniendo resumen por tipo: ${error.message}`);
        }
    }
}

export default HistorialService;