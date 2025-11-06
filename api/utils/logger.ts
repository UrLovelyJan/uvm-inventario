import fs from 'fs';
import path from 'path';

class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    getLogFilePath() {
        return path.join(this.logDir, `uvm-inventario-${this.getCurrentDate()}.log`);
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaString = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}\n`;
    }

    writeToFile(message) {
        try {
            fs.appendFileSync(this.getLogFilePath(), message, 'utf8');
        } catch (error) {
            console.error('Error escribiendo en archivo de log:', error);
        }
    }

    log(level, message, meta = {}) {
        const formattedMessage = this.formatMessage(level, message, meta);
        
        // Consola
        const consoleMethods = {
            info: console.log,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };

        const consoleMethod = consoleMethods[level] || console.log;
        consoleMethod(formattedMessage.trim());

        // Archivo (solo en producción o si está habilitado)
        if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
            this.writeToFile(formattedMessage);
        }
    }

    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, meta);
        }
    }

    // Logs específicos de la aplicación
    logDatabaseQuery(query, params, duration) {
        this.debug('Consulta a base de datos', {
            query,
            params,
            duration: `${duration}ms`
        });
    }

    logAuthAttempt(usuario, success, ip) {
        const level = success ? 'info' : 'warn';
        this.log(level, 'Intento de autenticación', {
            usuario,
            success,
            ip,
            timestamp: new Date().toISOString()
        });
    }

    logMovimiento(usuarioId, equipoId, cantidad, origen, destino) {
        this.info('Movimiento de equipo registrado', {
            usuarioId,
            equipoId,
            cantidad,
            origen,
            destino,
            timestamp: new Date().toISOString()
        });
    }

    logError(error, context = {}) {
        this.error('Error en la aplicación', {
            message: error.message,
            stack: error.stack,
            ...context
        });
    }

    logApiRequest(method, url, statusCode, duration, userId = null) {
        const level = statusCode >= 400 ? 'warn' : 'info';
        this.log(level, 'Solicitud API', {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            userId,
            timestamp: new Date().toISOString()
        });
    }
}

// Instancia singleton
const logger = new Logger();

export default logger;