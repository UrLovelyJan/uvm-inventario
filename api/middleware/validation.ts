import Joi from 'joi';

export const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        usuario: Joi.string().pattern(/^[a-zA-Z0-9_]+$/).min(3).max(30).required(),
        contraseña: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: error.details[0].message 
        });
    }
    next();
};

export const validateMovimiento = (req, res, next) => {
    const schema = Joi.object({
        equipo_id: Joi.number().integer().positive().required(),
        de_laboratorio_id: Joi.number().integer().positive().allow(null),
        a_laboratorio_id: Joi.number().integer().positive().required(),
        cantidad: Joi.number().integer().positive().required(),
        motivo: Joi.string().min(5).max(500).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: error.details[0].message 
        });
    }
    next();
};