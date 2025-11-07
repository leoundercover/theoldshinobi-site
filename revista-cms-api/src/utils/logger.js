/**
 * Logger Centralizado
 * Sistema de logging estruturado para a aplicação
 */

const config = require('../config');
const { LOG_LEVELS } = require('../constants');

/**
 * Cores para logs no console
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Formatar timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Formatar log para saída
 */
const formatLog = (level, message, meta = {}) => {
  const timestamp = getTimestamp();

  // Log estruturado
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };

  // Se estiver em desenvolvimento, formatar bonito
  if (config.isDevelopment) {
    const levelColors = {
      error: colors.red,
      warn: colors.yellow,
      info: colors.cyan,
      http: colors.magenta,
      debug: colors.dim
    };

    const color = levelColors[level] || colors.white;
    const levelStr = level.toUpperCase().padEnd(5);

    return `${colors.dim}${timestamp}${colors.reset} ${color}${levelStr}${colors.reset} ${message} ${
      Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''
    }`;
  }

  // Em produção, retornar JSON
  return JSON.stringify(logEntry);
};

/**
 * Logger Class
 */
class Logger {
  /**
   * Log de erro
   */
  error(message, meta = {}) {
    const log = formatLog(LOG_LEVELS.ERROR, message, meta);
    console.error(log);
  }

  /**
   * Log de aviso
   */
  warn(message, meta = {}) {
    const log = formatLog(LOG_LEVELS.WARN, message, meta);
    console.warn(log);
  }

  /**
   * Log de informação
   */
  info(message, meta = {}) {
    const log = formatLog(LOG_LEVELS.INFO, message, meta);
    console.log(log);
  }

  /**
   * Log de requisições HTTP
   */
  http(message, meta = {}) {
    const log = formatLog(LOG_LEVELS.HTTP, message, meta);
    console.log(log);
  }

  /**
   * Log de debug
   */
  debug(message, meta = {}) {
    if (config.isDevelopment) {
      const log = formatLog(LOG_LEVELS.DEBUG, message, meta);
      console.log(log);
    }
  }

  /**
   * Log de conexão de banco de dados
   */
  database(message, meta = {}) {
    this.info(`[DATABASE] ${message}`, meta);
  }

  /**
   * Log de autenticação
   */
  auth(message, meta = {}) {
    this.info(`[AUTH] ${message}`, meta);
  }

  /**
   * Log de API
   */
  api(message, meta = {}) {
    this.info(`[API] ${message}`, meta);
  }

  /**
   * Log de inicialização
   */
  startup(message, meta = {}) {
    this.info(`[STARTUP] ${message}`, meta);
  }

  /**
   * Log de shutdown
   */
  shutdown(message, meta = {}) {
    this.info(`[SHUTDOWN] ${message}`, meta);
  }
}

// Exportar instância única
module.exports = new Logger();
