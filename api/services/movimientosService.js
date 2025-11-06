import pool from '../config/database.js';

export class MovimientosService {
    /**
     * Obtiene todos los movimientos con información relacionada
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Array>} Lista de movimientos
     */
    static async getAllMovimientos(filters = {}) {
        try {
            let query = `
                SELECT m.*, 
                       e.modelo as equipo_nombre,
                       e.codigo_inventario,
                       dl.nombre as origen_nombre,
                       al.nombre as destino_nombre,
                       u.nombre as usuario_nombre,
                       s_origen.nombre as sede_origen,
                       s_destino.nombre as sede_destino
                FROM Movimiento m
                JOIN Equipo e ON m.equipo_id = e.id
                JOIN Laboratorio al ON m.a_laboratorio_id = al.id
                JOIN Sede s_destino ON al.sede_id = s_destino.id
                LEFT JOIN Laboratorio dl ON m.de_laboratorio_id = dl.id
                LEFT JOIN Sede s_origen ON dl.sede_id = s_origen.id
                JOIN Usuario u ON m.usuario_id = u.id
                WHERE 1=1
            `;
            
            const params = [];

            // Aplicar filtros
            if (filters.equipo_id) {
                query += ' AND m.equipo_id = ?';
                params.push(filters.equipo_id);
            }

            if (filters.laboratorio_id) {
                query += ' AND (m.de_laboratorio_id = ? OR m.a_laboratorio_id = ?)';
                params.push(filters.laboratorio_id, filters.laboratorio_id);
            }

            if (filters.usuario_id) {
                query += ' AND m.usuario_id = ?';
                params.push(filters.usuario_id);
            }

            if (filters.fecha_desde) {
                query += ' AND DATE(m.creado_en) >= ?';
                params.push(filters.fecha_desde);
            }

            if (filters.fecha_hasta) {
                query += ' AND DATE(m.creado_en) <= ?';
                params.push(filters.fecha_hasta);
            }

            if (filters.tipo) {
                if (filters.tipo === 'ENTRADA') {
                    query += ' AND m.de_laboratorio_id IS NULL';
                } else if (filters.tipo === 'SALIDA') {
                    query += ' AND m.a_laboratorio_id IS NULL';
                } else if (filters.tipo === 'TRANSFERENCIA') {
                    query += ' AND m.de_laboratorio_id IS NOT NULL AND m.a_laboratorio_id IS NOT NULL';
                }
            }

            query += ' ORDER BY m.creado_en DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            const [movimientos] = await pool.execute(query, params);

            return movimientos;

        } catch (error) {
            throw new Error(`Error obteniendo movimientos: ${error.message}`);
        }
    }

    /**
     * Crea un nuevo movimiento
     * @param {Object} movimientoData - Datos del movimiento
     * @param {number} usuarioId - ID del usuario que realiza el movimiento
     * @returns {Promise<Object>} Movimiento creado
     */
    static async crearMovimiento(movimientoData, usuarioId) {
        try {
            const { equipo_id, de_laboratorio_id, a_laboratorio_id, cantidad, motivo } = movimientoData;

            // Verificar que el equipo existe
            const [equipos] = await pool.execute(
                'SELECT id, estado FROM Equipo WHERE id = ?',
                [equipo_id]
            );

            if (equipos.length === 0) {
                throw new Error('Equipo no encontrado');
            }

            const equipo = equipos[0];
            if (equipo.estado === 'BAJA') {
                throw new Error('No se puede mover un equipo dado de baja');
            }

            // Verificar laboratorio destino
            const [labDestino] = await pool.execute(
                'SELECT id, capacidad FROM Laboratorio WHERE id = ?',
                [a_laboratorio_id]
            );

            if (labDestino.length === 0) {
                throw new Error('Laboratorio destino no encontrado');
            }

            // Si es un movimiento entre laboratorios, verificar stock en origen
            if (de_laboratorio_id) {
                const [inventarioOrigen] = await pool.execute(
                    'SELECT cantidad, cantidad_disponible FROM InventarioLaboratorio WHERE laboratorio_id = ? AND equipo_id = ?',
                    [de_laboratorio_id, equipo_id]
                );

                if (inventarioOrigen.length === 0) {
                    throw new Error('El equipo no existe en el laboratorio origen');
                }

                const stockOrigen = inventarioOrigen[0];
                if (stockOrigen.cantidad_disponible < cantidad) {
                    throw new Error('Stock insuficiente en el laboratorio origen');
                }

                // Verificar laboratorio origen
                const [labOrigen] = await pool.execute(
                    'SELECT id FROM Laboratorio WHERE id = ?',
                    [de_laboratorio_id]
                );

                if (labOrigen.length === 0) {
                    throw new Error('Laboratorio origen no encontrado');
                }
            }

            // Usar el stored procedure para el movimiento
            await pool.execute(
                'CALL sp_mover_equipo(?, ?, ?, ?, ?, ?)',
                [equipo_id, de_laboratorio_id, a_laboratorio_id, cantidad, motivo, usuarioId]
            );

            // Obtener el movimiento creado
            const [movimientos] = await pool.execute(`
                SELECT m.*, 
                       e.modelo as equipo_nombre,
                       e.codigo_inventario,
                       dl.nombre as origen_nombre,
                       al.nombre as destino_nombre,
                       u.nombre as usuario_nombre
                FROM Movimiento m
                JOIN Equipo e ON m.equipo_id = e.id
                JOIN Laboratorio al ON m.a_laboratorio_id = al.id
                LEFT JOIN Laboratorio dl ON m.de_laboratorio_id = dl.id
                JOIN Usuario u ON m.usuario_id = u.id
                WHERE m.usuario_id = ?
                ORDER BY m.creado_en DESC
                LIMIT 1
            `, [usuarioId]);

            return movimientos[0];

        } catch (error) {
            throw new Error(`Error creando movimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de movimientos
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Object>} Estadísticas de movimientos
     */
    static async getEstadisticasMovimientos(filters = {}) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_movimientos,
                    COUNT(CASE WHEN de_laboratorio_id IS NULL THEN 1 END) as altas,
                    COUNT(CASE WHEN de_laboratorio_id IS NOT NULL AND a_laboratorio_id IS NOT NULL THEN 1 END) as transferencias,
                    SUM(cantidad) as total_equipos_movidos,
                    COUNT(DISTINCT equipo_id) as equipos_diferentes,
                    COUNT(DISTINCT usuario_id) as usuarios_involucrados,
                    COUNT(DISTINCT a_laboratorio_id) as laboratorios_destino,
                    MAX(creado_en) as ultimo_movimiento
                FROM Movimiento
                WHERE 1=1
            `;
            
            const params = [];

            // Aplicar filtros de fecha
            if (filters.fecha_desde) {
                query += ' AND DATE(creado_en) >= ?';
                params.push(filters.fecha_desde);
            }

            if (filters.fecha_hasta) {
                query += ' AND DATE(creado_en) <= ?';
                params.push(filters.fecha_hasta);
            }

            const [stats] = await pool.execute(query, params);

            // Obtener movimientos por día (últimos 30 días)
            const [movimientosPorDia] = await pool.execute(`
                SELECT 
                    DATE(creado_en) as fecha,
                    COUNT(*) as cantidad_movimientos,
                    SUM(cantidad) as cantidad_equipos
                FROM Movimiento
                WHERE creado_en >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(creado_en)
                ORDER BY fecha DESC
            `);

            // Obtener equipos más movidos
            const [equiposMasMovidos] = await pool.execute(`
                SELECT 
                    e.codigo_inventario,
                    e.marca,
                    e.modelo,
                    COUNT(*) as veces_movido,
                    SUM(m.cantidad) as cantidad_total_movida
                FROM Movimiento m
                JOIN Equipo e ON m.equipo_id = e.id
                GROUP BY m.equipo_id, e.codigo_inventario, e.marca, e.modelo
                ORDER BY veces_movido DESC, cantidad_total_movida DESC
                LIMIT 10
            `);

            return {
                general: stats[0] || {},
                porDia: movimientosPorDia || [],
                equiposMasMovidos: equiposMasMovidos || []
            };

        } catch (error) {
            throw new Error(`Error obteniendo estadísticas: ${error.message}`);
        }
    }

    /**
     * Obtiene el historial de movimientos de un equipo
     * @param {number} equipoId - ID del equipo
     * @returns {Promise<Array>} Historial de movimientos
     */
    static async getHistorialPorEquipo(equipoId) {
        try {
            const [movimientos] = await pool.execute(`
                SELECT 
                    m.*,
                    dl.nombre as origen_nombre,
                    al.nombre as destino_nombre,
                    u.nombre as usuario_nombre,
                    CASE 
                        WHEN m.de_laboratorio_id IS NULL THEN 'ALTA'
                        ELSE 'MOVIMIENTO'
                    END as tipo_operacion
                FROM Movimiento m
                JOIN Laboratorio al ON m.a_laboratorio_id = al.id
                LEFT JOIN Laboratorio dl ON m.de_laboratorio_id = dl.id
                JOIN Usuario u ON m.usuario_id = u.id
                WHERE m.equipo_id = ?
                ORDER BY m.creado_en DESC
            `, [equipoId]);

            return movimientos;

        } catch (error) {
            throw new Error(`Error obteniendo historial: ${error.message}`);
        }
    }

    /**
     * Obtiene los movimientos recientes (últimos 7 días)
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} Movimientos recientes
     */
    static async getMovimientosRecientes(limit = 20) {
        try {
            const [movimientos] = await pool.execute(`
                SELECT 
                    m.*,
                    e.modelo as equipo_nombre,
                    e.codigo_inventario,
                    dl.nombre as origen_nombre,
                    al.nombre as destino_nombre,
                    u.nombre as usuario_nombre,
                    TIMESTAMPDIFF(HOUR, m.creado_en, NOW()) as horas_desde
                FROM Movimiento m
                JOIN Equipo e ON m.equipo_id = e.id
                JOIN Laboratorio al ON m.a_laboratorio_id = al.id
                LEFT JOIN Laboratorio dl ON m.de_laboratorio_id = dl.id
                JOIN Usuario u ON m.usuario_id = u.id
                WHERE m.creado_en >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                ORDER BY m.creado_en DESC
                LIMIT ?
            `, [limit]);

            return movimientos;

        } catch (error) {
            throw new Error(`Error obteniendo movimientos recientes: ${error.message}`);
        }
    }
}

export default MovimientosService;