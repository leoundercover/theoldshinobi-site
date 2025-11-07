const ResponseDTO = require('../dtos/ResponseDTO');

/**
 * Middleware global de tratamento de erros
 * Padroniza respostas de erro e loga erros
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro para debugging
  console.error('❌ Erro capturado:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Determinar statusCode
  const statusCode = err.statusCode || 500;

  // Determinar código de erro
  const errorCode = err.code || 'INTERNAL_ERROR';

  // Mensagem de erro
  const message = err.message || 'Erro interno do servidor';

  // Detalhes adicionais (se existirem)
  const details = err.details || null;

  // Criar resposta de erro padronizada
  const errorResponse = ResponseDTO.error(message, errorCode, details, statusCode);

  // Adicionar stack trace em ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Retornar resposta
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
