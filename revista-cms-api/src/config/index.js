/**
 * Configuração Centralizada da Aplicação
 * Todas as configurações do sistema em um único lugar
 */

require('dotenv').config();
const { AUTH_CONFIG, DATABASE_CONFIG, RATE_LIMIT, PAGINATION, ENVIRONMENTS } = require('../constants');

/**
 * Validar variáveis de ambiente obrigatórias
 */
const validateEnv = () => {
  const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não configuradas: ${missing.join(', ')}`);
  }

  // Validar JWT_SECRET
  if (process.env.JWT_SECRET.length < AUTH_CONFIG.MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET deve ter no mínimo ${AUTH_CONFIG.MIN_JWT_SECRET_LENGTH} caracteres`);
  }
};

// Executar validação
validateEnv();

/**
 * Configurações da Aplicação
 */
const config = {
  // Ambiente
  env: process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT,
  isDevelopment: process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT,
  isProduction: process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION,
  isTest: process.env.NODE_ENV === ENVIRONMENTS.TEST,

  // Servidor
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost'
  },

  // Banco de Dados
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || DATABASE_CONFIG.DEFAULT_POOL_MAX,
      min: parseInt(process.env.DB_POOL_MIN) || DATABASE_CONFIG.DEFAULT_POOL_MIN,
      idleTimeoutMillis: DATABASE_CONFIG.IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: DATABASE_CONFIG.CONNECTION_TIMEOUT_MS
    },
    statementTimeout: DATABASE_CONFIG.STATEMENT_TIMEOUT_MS
  },

  // Autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || AUTH_CONFIG.DEFAULT_JWT_EXPIRES_IN,
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || AUTH_CONFIG.DEFAULT_SALT_ROUNDS,
    minPasswordLength: AUTH_CONFIG.MIN_PASSWORD_LENGTH,
    maxPasswordLength: AUTH_CONFIG.MAX_PASSWORD_LENGTH
  },

  // CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  },

  // Rate Limiting
  rateLimit: {
    auth: {
      windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
      max: RATE_LIMIT.AUTH_MAX_REQUESTS
    },
    api: {
      windowMs: RATE_LIMIT.API_WINDOW_MS,
      max: RATE_LIMIT.API_MAX_REQUESTS
    },
    create: {
      windowMs: RATE_LIMIT.CREATE_WINDOW_MS,
      max: RATE_LIMIT.CREATE_MAX_REQUESTS
    },
    search: {
      windowMs: RATE_LIMIT.SEARCH_WINDOW_MS,
      max: RATE_LIMIT.SEARCH_MAX_REQUESTS
    },
    userContent: {
      windowMs: RATE_LIMIT.USER_CONTENT_WINDOW_MS,
      max: RATE_LIMIT.USER_CONTENT_MAX_REQUESTS
    }
  },

  // Paginação
  pagination: {
    defaultPage: PAGINATION.DEFAULT_PAGE,
    defaultLimit: PAGINATION.DEFAULT_LIMIT,
    maxLimit: PAGINATION.MAX_LIMIT,
    minLimit: PAGINATION.MIN_LIMIT
  },

  // Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800,
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    filesBaseUrl: process.env.FILES_BASE_URL || `http://localhost:${process.env.PORT || 3000}/uploads`
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT
  }
};

module.exports = config;
