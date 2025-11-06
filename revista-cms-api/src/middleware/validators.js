const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para processar erros de validação
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validações para registro de usuário
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email deve ter no máximo 255 caracteres'),

  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 8, max: 128 }).withMessage('Senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Senha deve conter pelo menos uma letra e um número')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])/).withMessage('Senha deve conter letras maiúsculas e minúsculas')
    .matches(/^(?=.*[@$!%*#?&])/).withMessage('Senha deve conter pelo menos um caractere especial (@$!%*#?&)'),

  handleValidationErrors
];

/**
 * Validações para login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Senha é obrigatória'),

  handleValidationErrors
];

/**
 * Validações para criar/atualizar publisher
 */
const publisherValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome da editora é obrigatório')
    .isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Descrição deve ter no máximo 5000 caracteres'),

  body('logo_url')
    .optional()
    .trim()
    .isURL().withMessage('URL do logo inválida'),

  handleValidationErrors
];

/**
 * Validações para criar/atualizar title
 */
const titleValidation = [
  body('publisher_id')
    .notEmpty().withMessage('ID da editora é obrigatório')
    .isInt({ min: 1 }).withMessage('ID da editora deve ser um número inteiro positivo'),

  body('name')
    .trim()
    .notEmpty().withMessage('Nome do título é obrigatório')
    .isLength({ min: 1, max: 255 }).withMessage('Nome deve ter entre 1 e 255 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Descrição deve ter no máximo 5000 caracteres'),

  body('cover_image_url')
    .optional()
    .trim()
    .isURL().withMessage('URL da capa inválida'),

  body('genre')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Gênero deve ter no máximo 100 caracteres'),

  handleValidationErrors
];

/**
 * Validações para criar/atualizar issue
 */
const issueValidation = [
  body('title_id')
    .notEmpty().withMessage('ID do título é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do título deve ser um número inteiro positivo'),

  body('issue_number')
    .trim()
    .notEmpty().withMessage('Número da edição é obrigatório')
    .isLength({ max: 50 }).withMessage('Número da edição deve ter no máximo 50 caracteres'),

  body('publication_year')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Ano de publicação inválido'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Descrição deve ter no máximo 5000 caracteres'),

  body('cover_image_url')
    .trim()
    .notEmpty().withMessage('URL da capa é obrigatória')
    .isURL().withMessage('URL da capa inválida'),

  body('pdf_file_url')
    .trim()
    .notEmpty().withMessage('URL do PDF é obrigatória')
    .isURL().withMessage('URL do PDF inválida'),

  body('page_count')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Número de páginas inválido'),

  body('author')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Nome do autor deve ter no máximo 255 caracteres'),

  body('artist')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Nome do artista deve ter no máximo 255 caracteres'),

  handleValidationErrors
];

/**
 * Validações para rating
 */
const ratingValidation = [
  param('issue_id')
    .isInt({ min: 1 }).withMessage('ID da edição inválido'),

  body('value')
    .notEmpty().withMessage('Valor da avaliação é obrigatório')
    .isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),

  handleValidationErrors
];

/**
 * Validações para comentário
 */
const commentValidation = [
  param('issue_id')
    .isInt({ min: 1 }).withMessage('ID da edição inválido'),

  body('content')
    .trim()
    .notEmpty().withMessage('Conteúdo do comentário é obrigatório')
    .isLength({ min: 1, max: 2000 }).withMessage('Comentário deve ter entre 1 e 2000 caracteres'),

  handleValidationErrors
];

/**
 * Validações para parâmetros de query (paginação, filtros)
 */
const queryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit deve ser entre 1 e 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset deve ser maior ou igual a 0'),

  query('title_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID do título inválido'),

  query('publication_year')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Ano de publicação inválido'),

  handleValidationErrors
];

/**
 * Validações para busca
 */
const searchValidation = [
  query('q')
    .trim()
    .notEmpty().withMessage('Parâmetro de busca "q" é obrigatório')
    .isLength({ min: 1, max: 100 }).withMessage('Busca deve ter entre 1 e 100 caracteres'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit deve ser entre 1 e 100'),

  handleValidationErrors
];

/**
 * Validações para ID em params
 */
const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),

  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  publisherValidation,
  titleValidation,
  issueValidation,
  ratingValidation,
  commentValidation,
  queryValidation,
  searchValidation,
  idValidation
};
