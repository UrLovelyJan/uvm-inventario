export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de MySQL
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            error: 'Registro duplicado',
            message: 'Ya existe un registro con esos datos'
        });
    }

    // Error de foreign key
    if (err.code === 'ER_NO_REFERENCED_ROW') {
        return res.status(400).json({
            error: 'Referencia inválida',
            message: 'Uno de los datos referenciados no existe'
        });
    }

    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador'
    });
};