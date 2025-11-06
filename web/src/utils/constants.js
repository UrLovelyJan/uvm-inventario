/**
 * Constantes de la aplicación UVM Inventario
 */

// Roles de usuario
export const ROLES = {
    JEFE: 'JEFE',
    AUXILIAR: 'AUXILIAR'
};

// Estados de equipo
export const ESTADOS_EQUIPO = {
    OPERATIVO: 'OPERATIVO',
    MANTENIMIENTO: 'MANTENIMIENTO',
    BAJA: 'BAJA'
};

// Tipos de equipo
export const TIPOS_EQUIPO = [
    'CPU',
    'LAPTOP',
    'ALL_IN_ONE',
    'PROYECTOR',
    'SWITCH',
    'ROUTER',
    'MONITOR',
    'IMPRESORA',
    'TABLET',
    'SERVIDOR'
];

// Acciones del historial
export const ACCIONES_HISTORIAL = {
    ALTA: 'ALTA',
    BAJA: 'BAJA',
    MOVIMIENTO: 'MOVIMIENTO',
    ACTUALIZACION: 'ACTUALIZACION'
};

// Regiones UVM
export const REGIONES_UVM = [
    'Ciudad de México y Zona Metropolitana',
    'Estado de México',
    'Jalisco',
    'Aguascalientes',
    'Puebla',
    'Querétaro',
    'Chihuahua',
    'Hermosillo',
    'Monterrey',
    'Mérida',
    'Veracruz',
    'San Luis Potosí',
    'Sinaloa',
    'Nuevo León'
];

// Sedes UVM (ejemplo)
export const SEDES_UVM = [
    { nombre: 'San Rafael', region: 'Ciudad de México y Zona Metropolitana' },
    { nombre: 'Coyoacán-Tlalpan', region: 'Ciudad de México y Zona Metropolitana' },
    { nombre: 'Hispano Coacalco', region: 'Estado de México' },
    { nombre: 'Lomas Verdes', region: 'Estado de México' },
    { nombre: 'Toluca', region: 'Estado de México' },
    { nombre: 'Guadalajara Sur', region: 'Jalisco' },
    { nombre: 'Campus Aguascalientes', region: 'Aguascalientes' },
    { nombre: 'Campus Puebla', region: 'Puebla' },
    { nombre: 'Campus Querétaro', region: 'Querétaro' },
    { nombre: 'Campus Monterrey', region: 'Nuevo León' }
];

// Colores de la aplicación
export const COLORS = {
    UVM_PRIMARY: '#A50000',
    UVM_DARK: '#111111',
    UVM_GRAY_800: '#1F1F1F',
    UVM_GRAY_700: '#2E2E2E',
    UVM_GRAY_500: '#8A8A8A',
    
    // Estados
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6'
};

// Configuración de la aplicación
export const APP_CONFIG = {
    NAME: 'UVM Inventario',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistema de gestión de inventario para laboratorios UVM',
    API_BASE_URL: process.env.NODE_ENV === 'production' 
        ? '/api' 
        : 'http://localhost:3000/api',
    
    // Local storage keys
    STORAGE_KEYS: {
        TOKEN: 'uvm_token',
        USER: 'uvm_user',
        THEME: 'uvm_theme'
    },

    // Paginación
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZES: [10, 25, 50, 100]
    },

    // Tiempos
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000 // 24 horas
};

// Mensajes de la aplicación
export const MESSAGES = {
    ERRORS: {
        NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
        UNAUTHORIZED: 'No autorizado. Por favor inicia sesión.',
        FORBIDDEN: 'No tienes permisos para realizar esta acción.',
        NOT_FOUND: 'Recurso no encontrado.',
        SERVER_ERROR: 'Error interno del servidor.',
        VALIDATION_ERROR: 'Por favor corrige los errores en el formulario.'
    },
    
    SUCCESS: {
        LOGIN: 'Inicio de sesión exitoso.',
        LOGOUT: 'Sesión cerrada correctamente.',
        CREATED: 'Registro creado exitosamente.',
        UPDATED: 'Registro actualizado exitosamente.',
        DELETED: 'Registro eliminado exitosamente.',
        MOVEMENT: 'Movimiento realizado exitosamente.'
    },
    
    WARNINGS: {
        UNSAVED_CHANGES: 'Tienes cambios sin guardar.',
        DELETE_CONFIRM: '¿Estás seguro de que quieres eliminar este registro?'
    }
};

// Especificaciones por tipo de equipo
export const ESPECIFICACIONES_POR_TIPO = {
    CPU: ['procesador', 'ram', 'almacenamiento', 'tarjeta_video', 'sistema_operativo'],
    LAPTOP: ['procesador', 'ram', 'almacenamiento', 'pantalla', 'bateria', 'sistema_operativo'],
    MONITOR: ['tamaño', 'resolucion', 'tipo', 'frecuencia', 'conectores'],
    PROYECTOR: ['luminosidad', 'resolucion', 'contraste', 'conectividad', 'tipo_lampara'],
    SWITCH: ['puertos', 'velocidad', 'gestionable', 'poe'],
    ROUTER: ['velocidad', 'bandas', 'puertos', 'cobertura', 'seguridad'],
    IMPRESORA: ['tipo', 'color', 'velocidad', 'conectividad', 'funciones']
};

export default {
    ROLES,
    ESTADOS_EQUIPO,
    TIPOS_EQUIPO,
    ACCIONES_HISTORIAL,
    REGIONES_UVM,
    SEDES_UVM,
    COLORS,
    APP_CONFIG,
    MESSAGES,
    ESPECIFICACIONES_POR_TIPO
};