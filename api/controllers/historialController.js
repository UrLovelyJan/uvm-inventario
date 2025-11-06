import pool from '../config/database.js';

export const getHistorial = async (req, res, next) => {
    try {
        const [historial] = await pool.execute(`
            SELECT h.*, 
                   e.modelo as equipo_nombre,
                   e.codigo_inventario,
                   l.nombre as laboratorio_nombre,
                   u.nombre as usuario_nombre
            FROM Historial h
            LEFT JOIN Equipo e ON h.equipo_id = e.id
            LEFT JOIN Laboratorio l ON h.laboratorio_id = l.id
            JOIN Usuario u ON h.usuario_id = u.id
            ORDER BY h.creado_en DESC
            LIMIT 100
        `);

        res.json(historial);

    } catch (error) {
        next(error);
    }
};