const express = require('express');
const {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  searchIssues
} = require('../controllers/issueController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/issues/search
 * @desc    Buscar edições
 * @access  Public
 */
router.get('/search', searchIssues);

/**
 * @route   GET /api/issues
 * @desc    Listar todas as edições (com filtros opcionais)
 * @access  Public
 */
router.get('/', getAllIssues);

/**
 * @route   GET /api/issues/:id
 * @desc    Obter uma edição por ID
 * @access  Public
 */
router.get('/:id', getIssueById);

/**
 * @route   POST /api/issues
 * @desc    Criar nova edição
 * @access  Private (Admin/Editor)
 */
router.post('/', authenticate, authorize('admin', 'editor'), createIssue);

/**
 * @route   PUT /api/issues/:id
 * @desc    Atualizar edição
 * @access  Private (Admin/Editor)
 */
router.put('/:id', authenticate, authorize('admin', 'editor'), updateIssue);

/**
 * @route   DELETE /api/issues/:id
 * @desc    Deletar edição
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), deleteIssue);

module.exports = router;
