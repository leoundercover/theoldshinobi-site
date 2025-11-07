const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para autenticação (login/register)
 * Mais restritivo para prevenir brute force
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo de 5 tentativas por janela
  message: {
    error: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Pula rate limiting em ambiente de teste
  skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * Rate limiter para API geral
 * Mais permissivo para operações normais
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 requisições por janela
  message: {
    error: 'Muitas requisições deste IP. Por favor, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * Rate limiter para operações de criação (POST)
 * Previne spam de conteúdo
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo de 20 criações por hora
  message: {
    error: 'Você atingiu o limite de criações por hora. Tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * Rate limiter para busca
 * Previne abuse de queries pesadas
 */
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo de 30 buscas por minuto
  message: {
    error: 'Muitas buscas realizadas. Aguarde um momento antes de tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * Rate limiter para comentários e avaliações
 * Previne spam de comentários
 */
const userContentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo de 10 comentários/avaliações por 5 minutos
  message: {
    error: 'Você está enviando conteúdo muito rapidamente. Por favor, aguarde alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});

module.exports = {
  authLimiter,
  apiLimiter,
  createLimiter,
  searchLimiter,
  userContentLimiter
};
