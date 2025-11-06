import pool from '../config/database.js';

export const getLaboratorios = async (req, res, next) => {
    try {
        const [laboratorios] = await pool.execute(`
            SELECT l.*, s.nombre as sede_nombre,
                   COUNT(DISTINCT il.equipo_id) as tipos_equipos,
                   SUM(il.cantidad) as total_equipos
            FROM Laboratorio l
            JOIN Sede s ON l.sede_id = s.id
            LEFT JOIN InventarioLaboratorio il ON l.id = il.laboratorio_id
            GROUP BY l.id
            ORDER BY s.nombre, l.nombre
        `);

        res.json(laboratorios);

    } catch (error) {
        next(error);
    }
};