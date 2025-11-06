import pool from '../config/database.ts';

export class EquiposService {
    /**
     * Obtiene todos los equipos con información de ubicación
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Array>} Lista de equipos
     */
    static async getAllEquipos(filters = {}) {
        try {
            let query = `
                SELECT e.*, 
                       l.nombre as laboratorio_nombre,
                       s.nombre as sede_nombre,
                       il.cantidad,
                       il.cantidad_disponible
                FROM Equipo e
                LEFT JOIN InventarioLaboratorio il ON e.id = il.equipo_id
                LEFT JOIN Laboratorio l ON il.laboratorio_id = l.id
                LEFT JOIN Sede s ON l.sede_id = s.id
                WHERE 1=1
            `;
            
            const params = [];

            // Aplicar filtros
            if (filters.tipo) {
                query += ' AND e.tipo = ?';
                params.push(filters.tipo);
            }

            if (filters.estado) {
                query += ' AND e.estado = ?';
                params.push(filters.estado);
            }

            if (filters.sede_id) {
                query += ' AND s.id = ?';
                params.push(filters.sede_id);
            }

            if (filters.laboratorio_id) {
                query += ' AND l.id = ?';
                params.push(filters.laboratorio_id);
            }

            if (filters.search) {
                query += ' AND (e.codigo_inventario LIKE ? OR e.marca LIKE ? OR e.modelo LIKE ? OR e.serie LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY e.creado_en DESC';

            const [equipos] = await pool.execute(query, params);

            return equipos;

        } catch (error) {
            throw new Error(`Error obteniendo equipos: ${error.message}`);
        }
    }

    /**
     * Obtiene un equipo por ID con información completa
     * @param {number} equipoId - ID del equipo
     * @returns {Promise<Object>} Datos del equipo
     */
    static async getEquipoById(equipoId) {
        try {
            const [equipos] = await pool.execute(`
                SELECT e.*, 
                       l.nombre as laboratorio_nombre,
                       s.nombre as sede_nombre,
                       il.cantidad,
                       il.cantidad_disponible,
                       il.actualizado_en
                FROM Equipo e
                LEFT JOIN InventarioLaboratorio il ON e.id = il.equipo_id
                LEFT JOIN Laboratorio l ON il.laboratorio_id = l.id
                LEFT JOIN Sede s ON l.sede_id = s.id
                WHERE e.id = ?
            `, [equipoId]);

            if (equipos.length === 0) {
                throw new Error('Equipo no encontrado');
            }

            const equipo = equipos[0];

            // Obtener historial del equipo
            const [historial] = await pool.execute(`
                SELECT h.*, 
                       u.nombre as usuario_nombre,
                       l.nombre as laboratorio_nombre
                FROM Historial h
                LEFT JOIN Usuario u ON h.usuario_id = u.id
                LEFT JOIN Laboratorio l ON h.laboratorio_id = l.id
                WHERE h.equipo_id = ?
                ORDER BY h.creado_en DESC
                LIMIT 50
            `, [equipoId]);

            // Obtener movimientos del equipo
            const [movimientos] = await pool.execute(`
                SELECT m.*,
                       dl.nombre as origen_nombre,
                       al.nombre as destino_nombre,
                       u.nombre as usuario_nombre
                FROM Movimiento m
                JOIN Laboratorio al ON m.a_laboratorio_id = al.id
                LEFT JOIN Laboratorio dl ON m.de_laboratorio_id = dl.id
                JOIN Usuario u ON m.usuario_id = u.id
                WHERE m.equipo_id = ?
                ORDER BY m.creado_en DESC
                LIMIT 20
            `, [equipoId]);

            return {
                ...equipo,
                historial: historial || [],
                movimientos: movimientos || []
            };

        } catch (error) {
            throw new Error(`Error obteniendo equipo: ${error.message}`);
        }
    }

    /**
     * Crea un nuevo equipo
     * @param {Object} equipoData - Datos del equipo
     * @returns {Promise<Object>} Equipo creado
     */
    static async createEquipo(equipoData) {
        try {
            const { 
                codigo_inventario, 
                tipo, 
                marca, 
                modelo, 
                serie, 
                especificaciones, 
                estado = 'OPERATIVO' 
            } = equipoData;

            // Verificar que el código de inventario no exista
            const [existingEquipos] = await pool.execute(
                'SELECT id FROM Equipo WHERE codigo_inventario = ?',
                [codigo_inventario]
            );

            if (existingEquipos.length > 0) {
                throw new Error('Ya existe un equipo con ese código de inventario');
            }

            // Convertir especificaciones a JSON si es un objeto
            const especificacionesJson = typeof especificaciones === 'object' 
                ? JSON.stringify(especificaciones) 
                : especificaciones;

            // Insertar nuevo equipo
            const [result] = await pool.execute(
                `INSERT INTO Equipo (codigo_inventario, tipo, marca, modelo, serie, especificaciones, estado) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [codigo_inventario, tipo, marca, modelo, serie, especificacionesJson, estado]
            );

            // Obtener equipo creado
            const [newEquipos] = await pool.execute(
                'SELECT * FROM Equipo WHERE id = ?',
                [result.insertId]
            );

            return newEquipos[0];

        } catch (error) {
            throw new Error(`Error creando equipo: ${error.message}`);
        }
    }

    /**
     * Actualiza un equipo existente
     * @param {number} equipoId - ID del equipo
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Equipo actualizado
     */
    static async updateEquipo(equipoId, updateData) {
        try {
            const { tipo, marca, modelo, serie, especificaciones, estado } = updateData;

            // Verificar que el equipo existe
            const [existingEquipos] = await pool.execute(
                'SELECT id FROM Equipo WHERE id = ?',
                [equipoId]
            );

            if (existingEquipos.length === 0) {
                throw new Error('Equipo no encontrado');
            }

            // Convertir especificaciones a JSON si es un objeto
            const especificacionesJson = especificaciones && typeof especificaciones === 'object' 
                ? JSON.stringify(especificaciones) 
                : especificaciones;

            // Actualizar equipo
            await pool.execute(
                `UPDATE Equipo 
                 SET tipo = ?, marca = ?, modelo = ?, serie = ?, especificaciones = ?, estado = ? 
                 WHERE id = ?`,
                [tipo, marca, modelo, serie, especificacionesJson, estado, equipoId]
            );

            // Obtener equipo actualizado
            const [updatedEquipos] = await pool.execute(
                'SELECT * FROM Equipo WHERE id = ?',
                [equipoId]
            );

            return updatedEquipos[0];

        } catch (error) {
            throw new Error(`Error actualizando equipo: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas generales de equipos
     * @returns {Promise<Object>} Estadísticas de equipos
     */
    static async getEstadisticas() {
        try {
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN estado = 'OPERATIVO' THEN 1 END) as operativos,
                    COUNT(CASE WHEN estado = 'MANTENIMIENTO' THEN 1 END) as mantenimiento,
                    COUNT(CASE WHEN estado = 'BAJA' THEN 1 END) as baja,
                    COUNT(DISTINCT tipo) as tipos_diferentes,
                    (SELECT COUNT(*) FROM InventarioLaboratorio WHERE cantidad_disponible > 0) as en_inventario
                FROM Equipo
            `);

            const [porTipo] = await pool.execute(`
                SELECT 
                    tipo,
                    COUNT(*) as cantidad,
                    COUNT(CASE WHEN estado = 'OPERATIVO' THEN 1 END) as operativos,
                    COUNT(CASE WHEN estado = 'MANTENIMIENTO' THEN 1 END) as mantenimiento,
                    COUNT(CASE WHEN estado = 'BAJA' THEN 1 END) as baja
                FROM Equipo
                GROUP BY tipo
                ORDER BY cantidad DESC
            `);

            return {
                general: stats[0] || {},
                porTipo: porTipo || []
            };

        } catch (error) {
            throw new Error(`Error obteniendo estadísticas: ${error.message}`);
        }
    }

    /**
     * Busca equipos por diferentes criterios
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Array>} Equipos encontrados
     */
    static async searchEquipos(searchTerm) {
        try {
            const searchPattern = `%${searchTerm}%`;
            
            const [equipos] = await pool.execute(`
                SELECT e.*, 
                       l.nombre as laboratorio_nombre,
                       s.nombre as sede_nombre
                FROM Equipo e
                LEFT JOIN InventarioLaboratorio il ON e.id = il.equipo_id
                LEFT JOIN Laboratorio l ON il.laboratorio_id = l.id
                LEFT JOIN Sede s ON l.sede_id = s.id
                WHERE e.codigo_inventario LIKE ? 
                   OR e.marca LIKE ? 
                   OR e.modelo LIKE ? 
                   OR e.serie LIKE ?
                   OR e.tipo LIKE ?
                ORDER BY 
                    CASE 
                        WHEN e.codigo_inventario LIKE ? THEN 1
                        WHEN e.marca LIKE ? THEN 2
                        WHEN e.modelo LIKE ? THEN 3
                        ELSE 4
                    END,
                    e.creado_en DESC
                LIMIT 50
            `, [
                searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
                searchPattern, searchPattern, searchPattern
            ]);

            return equipos;

        } catch (error) {
            throw new Error(`Error buscando equipos: ${error.message}`);
        }
    }
}

export default EquiposService;