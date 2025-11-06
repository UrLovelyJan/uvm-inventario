import bcrypt from 'bcryptjs';

/**
 * Utilidades generales para la aplicación
 */
export class Helpers {
    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valida un código de inventario UVM
     * @param {string} codigo - Código a validar
     * @returns {boolean} True si es válido
     */
    static isValidCodigoInventario(codigo) {
        const codigoRegex = /^UVM-[A-Z]{3}-[0-9]{3}$/;
        return codigoRegex.test(codigo);
    }

    /**
     * Genera un código de inventario único
     * @param {string} tipo - Tipo de equipo
     * @returns {string} Código generado
     */
    static generarCodigoInventario(tipo) {
        const prefix = 'UVM';
        const tipoCode = tipo.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${tipoCode}-${randomNum}`;
    }

    /**
     * Formatea una fecha para mostrar
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    static formatDate(date) {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Formatea una fecha relativa (hace X tiempo)
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} Tiempo relativo
     */
    static formatRelativeTime(date) {
        if (!date) return 'N/A';
        
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'hace un momento';
        if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        
        return this.formatDate(date);
    }

    /**
     * Sanitiza un string para prevenir inyecciones
     * @param {string} str - String a sanitizar
     * @returns {string} String sanitizado
     */
    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[<>]/g, '').trim();
    }

    /**
     * Valida y parsea especificaciones JSON
     * @param {string|Object} especificaciones - Especificaciones a validar
     * @returns {Object} Especificaciones parseadas
     */
    static parseEspecificaciones(especificaciones) {
        try {
            if (typeof especificaciones === 'string') {
                return JSON.parse(especificaciones);
            }
            return especificaciones || {};
        } catch (error) {
            return {};
        }
    }

    /**
     * Calcula el porcentaje de disponibilidad
     * @param {number} disponibles - Cantidad disponible
     * @param {number} total - Cantidad total
     * @returns {number} Porcentaje de disponibilidad
     */
    static calcularPorcentajeDisponible(disponibles, total) {
        if (!total || total === 0) return 0;
        return Math.round((disponibles / total) * 100);
    }

    /**
     * Obtiene el color según el porcentaje de disponibilidad
     * @param {number} porcentaje - Porcentaje de disponibilidad
     * @returns {string} Clase de color de Tailwind
     */
    static getColorDisponibilidad(porcentaje) {
        if (porcentaje >= 80) return 'text-green-600';
        if (porcentaje >= 60) return 'text-yellow-600';
        if (porcentaje >= 40) return 'text-orange-600';
        return 'text-red-600';
    }

    /**
     * Genera un hash de contraseña
     * @param {string} password - Contraseña a hashear
     * @returns {Promise<string>} Hash de la contraseña
     */
    static async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Verifica una contraseña contra un hash
     * @param {string} password - Contraseña a verificar
     * @param {string} hash - Hash a comparar
     * @returns {Promise<boolean>} True si coinciden
     */
    static async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Genera una respuesta estándar de la API
     * @param {boolean} success - Si fue exitoso
     * @param {string} message - Mensaje de respuesta
     * @param {*} data - Datos de respuesta
     * @returns {Object} Respuesta estándar
     */
    static apiResponse(success, message, data = null) {
        return {
            success,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Maneja errores de manera consistente
     * @param {Error} error - Error a manejar
     * @param {string} context - Contexto del error
     * @returns {Object} Error formateado
     */
    static handleError(error, context = '') {
        console.error(`Error en ${context}:`, error);
        
        return {
            success: false,
            error: error.message,
            context,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Valida los datos de un movimiento
     * @param {Object} movimientoData - Datos del movimiento
     * @returns {Object} Resultado de validación
     */
    static validarMovimiento(movimientoData) {
        const { equipo_id, de_laboratorio_id, a_laboratorio_id, cantidad, motivo } = movimientoData;

        const errors = [];

        if (!equipo_id) errors.push('El equipo es requerido');
        if (!a_laboratorio_id) errors.push('El laboratorio destino es requerido');
        if (!cantidad || cantidad <= 0) errors.push('La cantidad debe ser mayor a 0');
        if (!motivo || motivo.length < 5) errors.push('El motivo debe tener al menos 5 caracteres');
        if (de_laboratorio_id === a_laboratorio_id) errors.push('El laboratorio origen y destino no pueden ser el mismo');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Pagina un array de resultados
     * @param {Array} data - Datos a paginar
     * @param {number} page - Página actual
     * @param {number} limit - Límite por página
     * @returns {Object} Resultados paginados
     */
    static paginate(data, page = 1, limit = 10) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const results = data.slice(startIndex, endIndex);

        return {
            data: results,
            pagination: {
                current: page,
                total: Math.ceil(data.length / limit),
                totalItems: data.length,
                hasNext: endIndex < data.length,
                hasPrev: page > 1
            }
        };
    }
}

export default Helpers;