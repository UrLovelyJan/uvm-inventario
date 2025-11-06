/**
 * Utilidades de formateo para la aplicación
 */

/**
 * Formatea una fecha para mostrar
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, options = {}) => {
    if (!date) return 'N/A';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };

    return new Date(date).toLocaleDateString('es-ES', defaultOptions);
};

/**
 * Formatea una fecha con hora
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formatea una fecha relativa (hace X tiempo)
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Tiempo relativo
 */
export const formatRelativeTime = (date) => {
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
    if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    
    return formatDate(date);
};

/**
 * Formatea un número como cantidad
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
    if (typeof number !== 'number') return '0';
    return new Intl.NumberFormat('es-ES').format(number);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor del porcentaje
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 2) => {
    if (typeof value !== 'number') return '0%';
    return `${value.toFixed(decimals)}%`;
};

/**
 * Formatea el estado de un equipo
 * @param {string} estado - Estado del equipo
 * @returns {Object} Información formateada del estado
 */
export const formatEstadoEquipo = (estado) => {
    const estados = {
        OPERATIVO: { text: 'Operativo', color: 'green', class: 'bg-green-100 text-green-800' },
        MANTENIMIENTO: { text: 'Mantenimiento', color: 'yellow', class: 'bg-yellow-100 text-yellow-800' },
        BAJA: { text: 'Baja', color: 'red', class: 'bg-red-100 text-red-800' }
    };

    return estados[estado] || { text: estado, color: 'gray', class: 'bg-gray-100 text-gray-800' };
};

/**
 * Formatea el tipo de equipo
 * @param {string} tipo - Tipo de equipo
 * @returns {string} Tipo formateado
 */
export const formatTipoEquipo = (tipo) => {
    const tipos = {
        CPU: 'Computadora',
        LAPTOP: 'Laptop',
        ALL_IN_ONE: 'Todo en Uno',
        PROYECTOR: 'Proyector',
        SWITCH: 'Switch',
        ROUTER: 'Router',
        MONITOR: 'Monitor',
        IMPRESORA: 'Impresora',
        TABLET: 'Tablet',
        SERVIDOR: 'Servidor'
    };

    return tipos[tipo] || tipo;
};

/**
 * Formatea la acción del historial
 * @param {string} accion - Acción del historial
 * @returns {Object} Información formateada de la acción
 */
export const formatAccionHistorial = (accion) => {
    const acciones = {
        ALTA: { text: 'Alta', color: 'green', class: 'bg-green-100 text-green-800', icon: '➕' },
        BAJA: { text: 'Baja', color: 'red', class: 'bg-red-100 text-red-800', icon: '➖' },
        MOVIMIENTO: { text: 'Movimiento', color: 'blue', class: 'bg-blue-100 text-blue-800', icon: '🔄' },
        ACTUALIZACION: { text: 'Actualización', color: 'yellow', class: 'bg-yellow-100 text-yellow-800', icon: '✏️' }
    };

    return acciones[accion] || { text: accion, color: 'gray', class: 'bg-gray-100 text-gray-800', icon: '📝' };
};

/**
 * Formatea el rol de usuario
 * @param {string} rol - Rol del usuario
 * @returns {Object} Información formateada del rol
 */
export const formatRolUsuario = (rol) => {
    const roles = {
        JEFE: { text: 'Jefe de Departamento', color: 'purple', class: 'bg-purple-100 text-purple-800' },
        AUXILIAR: { text: 'Auxiliar', color: 'blue', class: 'bg-blue-100 text-blue-800' }
    };

    return roles[rol] || { text: rol, color: 'gray', class: 'bg-gray-100 text-gray-800' };
};

/**
 * Formatea las especificaciones JSON de un equipo
 * @param {string|Object} especificaciones - Especificaciones a formatear
 * @returns {Object} Especificaciones parseadas
 */
export const parseEspecificaciones = (especificaciones) => {
    try {
        if (typeof especificaciones === 'string') {
            return JSON.parse(especificaciones);
        }
        return especificaciones || {};
    } catch (error) {
        console.error('Error parseando especificaciones:', error);
        return {};
    }
};

/**
 * Formatea especificaciones para mostrar
 * @param {string|Object} especificaciones - Especificaciones a formatear
 * @returns {Array} Lista de especificaciones formateadas
 */
export const formatEspecificaciones = (especificaciones) => {
    const parsed = parseEspecificaciones(especificaciones);
    
    return Object.entries(parsed).map(([key, value]) => ({
        key: key.replace(/_/g, ' ').toUpperCase(),
        value: typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value
    }));
};

/**
 * Trunca un texto si es muy largo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatea un tamaño de archivo en bytes a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida un código de inventario UVM
 * @param {string} codigo - Código a validar
 * @returns {boolean} True si es válido
 */
export const isValidCodigoInventario = (codigo) => {
    const codigoRegex = /^UVM-[A-Z]{3}-[0-9]{3}$/;
    return codigoRegex.test(codigo);
};

export default {
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatNumber,
    formatPercentage,
    formatEstadoEquipo,
    formatTipoEquipo,
    formatAccionHistorial,
    formatRolUsuario,
    parseEspecificaciones,
    formatEspecificaciones,
    truncateText,
    capitalize,
    formatFileSize,
    isValidEmail,
    isValidCodigoInventario
};