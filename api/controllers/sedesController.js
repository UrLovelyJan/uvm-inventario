import pool from '../config/database.js';

export const getSedes = async (req, res, next) => {
    try {
        const [sedes] = await pool.execute(`
            SELECT s.*, 
                   COUNT(DISTINCT l.id) as total_laboratorios,
                   COUNT(DISTINCT il.equipo_id) as total_equipos
            FROM Sede s
            LEFT JOIN Laboratorio l ON s.id = l.sede_id
            LEFT JOIN InventarioLaboratorio il ON l.id = il.laboratorio_id
            WHERE s.activa = TRUE
            GROUP BY s.id
            ORDER BY s.nombre
        `);

        res.json(sedes);

    } catch (error) {
        next(error);
    }
};