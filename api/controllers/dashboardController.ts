import pool from '../config/database.ts';

export const getDashboardData = async (req, res, next) => {
    try {
        // Obtener métricas principales
        const [metrics] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM Equipo) as total_equipos,
                (SELECT COUNT(*) FROM Laboratorio) as total_laboratorios,
                (SELECT COUNT(*) FROM Equipo WHERE estado = 'OPERATIVO') as equipos_operativos,
                (SELECT COUNT(*) FROM Movimiento WHERE DATE(creado_en) = CURDATE()) as movimientos_hoy
        `);

        // Obtener distribución por sede
        const [distribution] = await pool.execute(`
            SELECT s.nombre as sede, COUNT(DISTINCT l.id) as laboratorios, 
                   SUM(il.cantidad) as total_equipos,
                   ROUND((SUM(il.cantidad_disponible) / SUM(il.cantidad)) * 100, 2) as porcentaje_disponible
            FROM Sede s
            LEFT JOIN Laboratorio l ON s.id = l.sede_id
            LEFT JOIN InventarioLaboratorio il ON l.id = il.laboratorio_id
            WHERE s.activa = TRUE
            GROUP BY s.id
            ORDER BY total_equipos DESC
        `);

        // Obtener movimientos recientes
        const [movements] = await pool.execute(`
            SELECT m.id, e.modelo as equipo, 
                   dl.nombre as origen, al.nombre as destino,
                   m.cantidad, m.motivo, u.nombre as usuario, m.creado_en
            FROM Movimiento m
            JOIN Equipo e ON m.equipo_id = e.id
            JOIN Laboratorio al ON m.a_laboratorio_id = al.id
            LEFT JOIN Laboratorio dl ON m.de_laboratorio_id = dl.id
            JOIN Usuario u ON m.usuario_id = u.id
            ORDER BY m.creado_en DESC
            LIMIT 10
        `);

        res.json({
            metrics: metrics[0],
            distribution,
            recentMovements: movements
        });

    } catch (error) {
        next(error);
    }
};