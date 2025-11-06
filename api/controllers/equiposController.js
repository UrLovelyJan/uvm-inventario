import { EquiposService } from '../services/equiposService.js';

export const getEquipos = async (req, res, next) => {
    try {
        const filters = {
            tipo: req.query.tipo,
            estado: req.query.estado,
            sede_id: req.query.sede_id,
            laboratorio_id: req.query.laboratorio_id,
            search: req.query.search
        };

        const equipos = await EquiposService.getAllEquipos(filters);
        const estadisticas = await EquiposService.getEstadisticas();

        res.json({
            equipos,
            ...estadisticas
        });

    } catch (error) {
        next(error);
    }
};

export const getEquipoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const equipo = await EquiposService.getEquipoById(parseInt(id));
        res.json(equipo);

    } catch (error) {
        next(error);
    }
};