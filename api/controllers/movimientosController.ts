import pool from '../config/database.ts';

export const getMovimientos = async (req, res, next) => {
    try {
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
            ORDER BY m.creado_en DESC
        `);

        res.json(movimientos);

    } catch (error) {
        next(error);
    }
};

export const crearMovimiento = async (req, res, next) => {
    try {
        const { equipo_id, de_laboratorio_id, a_laboratorio_id, cantidad, motivo } = req.body;
        const usuario_id = req.user.id;

        // Llamar al stored procedure
        await pool.execute(
            'CALL sp_mover_equipo(?, ?, ?, ?, ?, ?)',
            [equipo_id, de_laboratorio_id, a_laboratorio_id, cantidad, motivo, usuario_id]
        );

        res.json({ 
            success: true, 
            message: 'Movimiento realizado exitosamente' 
        });

    } catch (error) {
        next(error);
    }
};