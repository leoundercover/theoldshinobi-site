/**
 * Constantes da Aplicação
 * Centraliza todos os valores mágicos e enums
 */

/**
 * Roles de Usuário
 */
const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  READER: 'reader'
};

/**
 * Status HTTP
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Códigos de Erro
 */
const ERROR_CODES = {
  // Autenticação
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_PASSWORD: 'INVALID_PASSWORD',

  // Usuários
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  EMAIL_INVALID: 'EMAIL_INVALID',

  // Recursos
  ISSUE_NOT_FOUND: 'ISSUE_NOT_FOUND',
  TITLE_NOT_FOUND: 'TITLE_NOT_FOUND',
  PUBLISHER_NOT_FOUND: 'PUBLISHER_NOT_FOUND',

  // Validação
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_ID: 'INVALID_ID',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Duplicatas
  DUPLICATE_ISSUE: 'DUPLICATE_ISSUE',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Permissões
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // Geral
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  NO_VALID_FIELDS: 'NO_VALID_FIELDS',
  SEARCH_TERM_REQUIRED: 'SEARCH_TERM_REQUIRED'
};

/**
 * Configurações de Paginação
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

/**
 * Configurações de Autenticação
 */
const AUTH_CONFIG = {
  DEFAULT_JWT_EXPIRES_IN: '7d',
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  DEFAULT_SALT_ROUNDS: 12,
  MIN_JWT_SECRET_LENGTH: 32
};

/**
 * Rate Limiting
 */
const RATE_LIMIT = {
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  AUTH_MAX_REQUESTS: 5,

  API_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  API_MAX_REQUESTS: 100,

  CREATE_WINDOW_MS: 60 * 60 * 1000, // 1 hora
  CREATE_MAX_REQUESTS: 20,

  SEARCH_WINDOW_MS: 1 * 60 * 1000, // 1 minuto
  SEARCH_MAX_REQUESTS: 30,

  USER_CONTENT_WINDOW_MS: 5 * 60 * 1000, // 5 minutos
  USER_CONTENT_MAX_REQUESTS: 10
};

/**
 * Configurações de Banco de Dados
 */
const DATABASE_CONFIG = {
  DEFAULT_POOL_MAX: 20,
  DEFAULT_POOL_MIN: 5,
  IDLE_TIMEOUT_MS: 30000,
  CONNECTION_TIMEOUT_MS: 2000,
  STATEMENT_TIMEOUT_MS: 10000
};

/**
 * Gêneros de Revistas
 */
const GENRES = {
  SUPERHERO: 'Super-herói',
  MANGA: 'Mangá',
  INDEPENDENT: 'Independente',
  HORROR: 'Terror',
  FANTASY: 'Fantasia',
  SCI_FI: 'Ficção Científica',
  ADVENTURE: 'Aventura',
  COMEDY: 'Comédia',
  DRAMA: 'Drama',
  ROMANCE: 'Romance'
};

/**
 * Configurações de Upload
 */
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 52428800, // 50MB em bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_PDF_TYPES: ['application/pdf'],
  UPLOAD_DIR: './uploads',
  COVERS_DIR: './uploads/covers',
  PDFS_DIR: './uploads/pdfs'
};

/**
 * Mensagens Padrão
 */
const MESSAGES = {
  // Sucesso
  SUCCESS: 'Operação realizada com sucesso',
  CREATED: 'Recurso criado com sucesso',
  UPDATED: 'Recurso atualizado com sucesso',
  DELETED: 'Recurso deletado com sucesso',

  // Autenticação
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso',
  REGISTER_SUCCESS: 'Usuário registrado com sucesso',
  PASSWORD_CHANGED: 'Senha alterada com sucesso',

  // Erros
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Recurso não encontrado',
  VALIDATION_ERROR: 'Erro de validação',
  INTERNAL_ERROR: 'Erro interno do servidor'
};

/**
 * Ambientes
 */
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
  STAGING: 'staging'
};

/**
 * Logs Levels
 */
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug'
};

module.exports = {
  USER_ROLES,
  HTTP_STATUS,
  ERROR_CODES,
  PAGINATION,
  AUTH_CONFIG,
  RATE_LIMIT,
  DATABASE_CONFIG,
  GENRES,
  UPLOAD_CONFIG,
  MESSAGES,
  ENVIRONMENTS,
  LOG_LEVELS
};
