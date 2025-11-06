import pool from '../config/database.js';

export class LaboratoriosService {
    /**
     * Obtiene todos los laboratorios con información de sede
     * @returns {Promise<Array>} Lista de laboratorios
     */
    static async getAllLaboratorios() {
        try {
            const [laboratorios] = await pool.execute(`
                SELECT l.*, 
                       s.nombre as sede_nombre,
                       s.region,
                       COUNT(DISTINCT il.equipo_id) as tipos_equipos,
                       SUM(il.cantidad) as total_equipos,
                       SUM(il.cantidad_disponible) as equipos_disponibles,
                       ROUND((SUM(il.cantidad_disponible) / SUM(il.cantidad)) * 100, 2) as porcentaje_disponible
                FROM Laboratorio l
                JOIN Sede s ON l.sede_id = s.id
                LEFT JOIN InventarioLaboratorio il ON l.id = il.laboratorio_id
                GROUP BY l.id
                ORDER BY s.nombre, l.nombre
            `);

            return laboratorios;

        } catch (error) {
            throw new Error(`Error obteniendo laboratorios: ${error.message}`);
        }
    }

    /**
     * Obtiene un laboratorio por ID con información detallada
     * @param {number} laboratorioId - ID del laboratorio
     * @returns {Promise<Object>} Datos del laboratorio
     */
    static async getLaboratorioById(laboratorioId) {
        try {
            const [laboratorios] = await pool.execute(`
                SELECT l.*, 
                       s.nombre as sede_nombre,
                       s.region,
                       s.id as sede_id
                FROM Laboratorio l
                JOIN Sede s ON l.sede_id = s.id
                WHERE l.id = ?
            `, [laboratorioId]);

            if (laboratorios.length === 0) {
                throw new Error('Laboratorio no encontrado');
            }

            const laboratorio = laboratorios[0];

            // Obtener inventario del laboratorio
            const [inventario] = await pool.execute(`
                SELECT 
                    e.*,
                    il.cantidad,
                    il.cantidad_disponible,
                    il.actualizado_en
                FROM InventarioLaboratorio il
                JOIN Equipo e ON il.equipo_id = e.id
                WHERE il.laboratorio_id = ?
                ORDER BY e.tipo, e.modelo
            `, [laboratorioId]);

            // Obtener estadísticas
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(DISTINCT il.equipo_id) as tipos_equipos,
                    SUM(il.cantidad) as total_equipos,
                    SUM(il.cantidad_disponible) as equipos_disponibles,
                    ROUND((SUM(il.cantidad_disponible) / SUM(il.cantidad)) * 100, 2) as porcentaje_disponible,
                    COUNT(CASE WHEN e.estado = 'OPERATIVO' THEN 1 END) as equipos_operativos,
                    COUNT(CASE WHEN e.estado = 'MANTENIMIENTO' THEN 1 END) as equipos_mantenimiento
                FROM InventarioLaboratorio il
                JOIN Equipo e ON il.equipo_id = e.id
                WHERE il.laboratorio_id = ?
            `, [laboratorioId]);

            return {
                ...laboratorio,
                inventario: inventario || [],
                estadisticas: stats[0] || {}
            };

        } catch (error) {
            throw new Error(`Error obteniendo laboratorio: ${error.message}`);
        }
    }

    /**
     * Crea un nuevo laboratorio
     * @param {Object} laboratorioData - Datos del laboratorio
     * @returns {Promise<Object>} Laboratorio creado
     */
    static async createLaboratorio(laboratorioData) {
        try {
            const { sede_id, nombre, capacidad, responsable } = laboratorioData;

            // Verificar que la sede existe
            const [sedes] = await pool.execute(
                'SELECT id FROM Sede WHERE id = ? AND activa = TRUE',
                [sede_id]
            );

            if (sedes.length === 0) {
                throw new Error('Sede no encontrada o inactiva');
            }

            // Verificar que no exista un laboratorio con el mismo nombre en la misma sede
            const [existingLabs] = await pool.execute(
                'SELECT id FROM Laboratorio WHERE sede_id = ? AND nombre = ?',
                [sede_id, nombre]
            );

            if (existingLabs.length > 0) {
                throw new Error('Ya existe un laboratorio con ese nombre en esta sede');
            }

            // Insertar nuevo laboratorio
            const [result] = await pool.execute(
                'INSERT INTO Laboratorio (sede_id, nombre, capacidad, responsable) VALUES (?, ?, ?, ?)',
                [sede_id, nombre, capacidad, responsable]
            );

            // Obtener laboratorio creado
            const [newLabs] = await pool.execute(`
                SELECT l.*, s.nombre as sede_nombre 
                FROM Laboratorio l 
                JOIN Sede s ON l.sede_id = s.id 
                WHERE l.id = ?`,
                [result.insertId]
            );

            return newLabs[0];

        } catch (error) {
            throw new Error(`Error creando laboratorio: ${error.message}`);
        }
    }

    /**
     * Actualiza un laboratorio existente
     * @param {number} laboratorioId - ID del laboratorio
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Laboratorio actualizado
     */
    static async updateLaboratorio(laboratorioId, updateData) {
        try {
            const { nombre, capacidad, responsable } = updateData;

            // Verificar que el laboratorio existe
            const [existingLabs] = await pool.execute(
                'SELECT id FROM Laboratorio WHERE id = ?',
                [laboratorioId]
            );

            if (existingLabs.length === 0) {
                throw new Error('Laboratorio no encontrado');
            }

            // Actualizar laboratorio
            await pool.execute(
                'UPDATE Laboratorio SET nombre = ?, capacidad = ?, responsable = ? WHERE id = ?',
                [nombre, capacidad, responsable, laboratorioId]
            );

            // Obtener laboratorio actualizado
            const [updatedLabs] = await pool.execute(`
                SELECT l.*, s.nombre as sede_nombre 
                FROM Laboratorio l 
                JOIN Sede s ON l.sede_id = s.id 
                WHERE l.id = ?`,
                [laboratorioId]
            );

            return updatedLabs[0];

        } catch (error) {
            throw new Error(`Error actualizando laboratorio: ${error.message}`);
        }
    }

    /**
     * Obtiene el inventario detallado de un laboratorio
     * @param {number} laboratorioId - ID del laboratorio
     * @returns {Promise<Array>} Inventario del laboratorio
     */
    static async getInventarioLaboratorio(laboratorioId) {
        try {
            const [inventario] = await pool.execute(`
                SELECT 
                    e.id,
                    e.codigo_inventario,
                    e.tipo,
                    e.marca,
                    e.modelo,
                    e.serie,
                    e.especificaciones,
                    e.estado,
                    il.cantidad,
                    il.cantidad_disponible,
                    il.actualizado_en,
                    CASE 
                        WHEN il.cantidad_disponible = 0 THEN 'AGOTADO'
                        WHEN il.cantidad_disponible < il.cantidad * 0.2 THEN 'BAJO_STOCK'
                        ELSE 'DISPONIBLE'
                    END as estado_stock
                FROM InventarioLaboratorio il
                JOIN Equipo e ON il.equipo_id = e.id
                WHERE il.laboratorio_id = ?
                ORDER BY e.tipo, e.marca, e.modelo
            `, [laboratorioId]);

            return inventario;

        } catch (error) {
            throw new Error(`Error obteniendo inventario: ${error.message}`);
        }
    }

    /**
     * Obtiene los movimientos recientes de un laboratorio
     * @param {number} laboratorioId - ID del laboratorio
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} Movimientos del laboratorio
     */
    static async getMovimientosLaboratorio(laboratorioId, limit = 20) {
        try {
            const [movimientos] = await pool.execute(`
                SELECT 
                    m.*,
                    e.modelo as equipo_nombre,
                    e.codigo_inventario,
                    dl.nombre as origen_nombre,
                    al.nombre as destino_nombre,
                    u.nombre as usuario_nombre,
                    CASE 
                        WHEN m.de_laboratorio_id = ? THEN 'SALIDA'
                        WHEN m.a_laboratorio_id = ? THEN 'ENTRADA'
                        ELSE 'OTRO'
                    END as tipo_movimiento
                FROM Movimiento m
                JOIN Equipo e ON m.equipo_id = e.id
                JOIN Laboratorio al ON m.a_laboratorio_id = al.id
                LEFT JOIN Laboratorio dl ON m.de_laboratorio_id = dl.id
                JOIN Usuario u ON m.usuario_id = u.id
                WHERE m.de_laboratorio_id = ? OR m.a_laboratorio_id = ?
                ORDER BY m.creado_en DESC
                LIMIT ?
            `, [laboratorioId, laboratorioId, laboratorioId, laboratorioId, limit]);

            return movimientos;

        } catch (error) {
            throw new Error(`Error obteniendo movimientos: ${error.message}`);
        }
    }
}

export default LaboratoriosService;