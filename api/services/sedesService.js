import pool from '../config/database.js';

export class SedesService {
    /**
     * Obtiene todas las sedes activas con estadísticas
     * @returns {Promise<Array>} Lista de sedes
     */
    static async getAllSedes() {
        try {
            const [sedes] = await pool.execute(`
                SELECT s.*, 
                       COUNT(DISTINCT l.id) as total_laboratorios,
                       COUNT(DISTINCT il.equipo_id) as total_equipos,
                       SUM(il.cantidad) as cantidad_total_equipos,
                       ROUND(AVG(il.cantidad_disponible / NULLIF(il.cantidad, 0)) * 100, 2) as porcentaje_promedio_disponible
                FROM Sede s
                LEFT JOIN Laboratorio l ON s.id = l.sede_id
                LEFT JOIN InventarioLaboratorio il ON l.id = il.laboratorio_id
                WHERE s.activa = TRUE
                GROUP BY s.id
                ORDER BY s.nombre
            `);

            return sedes;

        } catch (error) {
            throw new Error(`Error obteniendo sedes: ${error.message}`);
        }
    }

    /**
     * Obtiene una sede por ID con información detallada
     * @param {number} sedeId - ID de la sede
     * @returns {Promise<Object>} Datos de la sede
     */
    static async getSedeById(sedeId) {
        try {
            const [sedes] = await pool.execute(`
                SELECT s.*, 
                       COUNT(DISTINCT l.id) as total_laboratorios,
                       SUM(il.cantidad) as total_equipos,
                       SUM(il.cantidad_disponible) as equipos_disponibles
                FROM Sede s
                LEFT JOIN Laboratorio l ON s.id = l.sede_id
                LEFT JOIN InventarioLaboratorio il ON l.id = il.laboratorio_id
                WHERE s.id = ?
                GROUP BY s.id
            `, [sedeId]);

            if (sedes.length === 0) {
                throw new Error('Sede no encontrada');
            }

            return sedes[0];

        } catch (error) {
            throw new Error(`Error obteniendo sede: ${error.message}`);
        }
    }

    /**
     * Crea una nueva sede
     * @param {Object} sedeData - Datos de la sede
     * @returns {Promise<Object>} Sede creada
     */
    static async createSede(sedeData) {
        try {
            const { nombre, region, activa = true } = sedeData;

            // Verificar que la sede no exista
            const [existingSedes] = await pool.execute(
                'SELECT id FROM Sede WHERE nombre = ?',
                [nombre]
            );

            if (existingSedes.length > 0) {
                throw new Error('Ya existe una sede con ese nombre');
            }

            // Insertar nueva sede
            const [result] = await pool.execute(
                'INSERT INTO Sede (nombre, region, activa) VALUES (?, ?, ?)',
                [nombre, region, activa]
            );

            // Obtener sede creada
            const [newSedes] = await pool.execute(
                'SELECT * FROM Sede WHERE id = ?',
                [result.insertId]
            );

            return newSedes[0];

        } catch (error) {
            throw new Error(`Error creando sede: ${error.message}`);
        }
    }

    /**
     * Actualiza una sede existente
     * @param {number} sedeId - ID de la sede
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Sede actualizada
     */
    static async updateSede(sedeId, updateData) {
        try {
            const { nombre, region, activa } = updateData;

            // Verificar que la sede existe
            const [existingSedes] = await pool.execute(
                'SELECT id FROM Sede WHERE id = ?',
                [sedeId]
            );

            if (existingSedes.length === 0) {
                throw new Error('Sede no encontrada');
            }

            // Actualizar sede
            await pool.execute(
                'UPDATE Sede SET nombre = ?, region = ?, activa = ? WHERE id = ?',
                [nombre, region, activa, sedeId]
            );

            // Obtener sede actualizada
            const [updatedSedes] = await pool.execute(
                'SELECT * FROM Sede WHERE id = ?',
                [sedeId]
            );

            return updatedSedes[0];

        } catch (error) {
            throw new Error(`Error actualizando sede: ${error.message}`);
        }
    }

    /**
     * Obtiene el inventario consolidado por sede
     * @returns {Promise<Array>} Inventario por sede
     */
    static async getInventarioPorSede() {
        try {
            const [inventario] = await pool.execute(`
                SELECT 
                    s.id,
                    s.nombre as sede,
                    s.region,
                    COUNT(DISTINCT l.id) as laboratorios,
                    COUNT(DISTINCT il.equipo_id) as tipos_equipos,
                    SUM(il.cantidad) as total_equipos,
                    SUM(il.cantidad_disponible) as equipos_disponibles,
                    ROUND((SUM(il.cantidad_disponible) / SUM(il.cantidad)) * 100, 2) as porcentaje_disponible
                FROM Sede s
                LEFT JOIN Laboratorio l ON s.id = l.sede_id
                LEFT JOIN InventarioLaboratorio il ON l.id = il.laboratorio_id
                WHERE s.activa = TRUE
                GROUP BY s.id, s.nombre, s.region
                ORDER BY total_equipos DESC
            `);

            return inventario;

        } catch (error) {
            throw new Error(`Error obteniendo inventario por sede: ${error.message}`);
        }
    }

    /**
     * Obtiene las estadísticas de equipos por tipo en una sede
     * @param {number} sedeId - ID de la sede
     * @returns {Promise<Array>} Estadísticas por tipo
     */
    static async getEstadisticasEquiposPorTipo(sedeId) {
        try {
            const [estadisticas] = await pool.execute(`
                SELECT 
                    e.tipo,
                    COUNT(*) as cantidad_total,
                    SUM(il.cantidad) as cantidad_inventario,
                    SUM(CASE WHEN e.estado = 'OPERATIVO' THEN 1 ELSE 0 END) as operativos,
                    SUM(CASE WHEN e.estado = 'MANTENIMIENTO' THEN 1 ELSE 0 END) as mantenimiento,
                    SUM(CASE WHEN e.estado = 'BAJA' THEN 1 ELSE 0 END) as baja
                FROM Equipo e
                JOIN InventarioLaboratorio il ON e.id = il.equipo_id
                JOIN Laboratorio l ON il.laboratorio_id = l.id
                JOIN Sede s ON l.sede_id = s.id
                WHERE s.id = ?
                GROUP BY e.tipo
                ORDER BY cantidad_inventario DESC
            `, [sedeId]);

            return estadisticas;

        } catch (error) {
            throw new Error(`Error obteniendo estadísticas por tipo: ${error.message}`);
        }
    }
}

export default SedesService;