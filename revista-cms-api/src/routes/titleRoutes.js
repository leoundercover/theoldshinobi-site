const express = require('express');
const {
  getAllTitles,
  getTitleById,
  createTitle,
  updateTitle,
  deleteTitle
} = require('../controllers/titleController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/titles
 * @desc    Listar todos os títulos (com filtro opcional por editora)
 * @access  Public
 */
router.get('/', getAllTitles);

/**
 * @route   GET /api/titles/:id
 * @desc    Obter um título por ID
 * @access  Public
 */
router.get('/:id', getTitleById);

/**
 * @route   POST /api/titles
 * @desc    Criar novo título
 * @access  Private (Admin/Editor)
 */
router.post('/', authenticate, authorize('admin', 'editor'), createTitle);

/**
 * @route   PUT /api/titles/:id
 * @desc    Atualizar título
 * @access  Private (Admin/Editor)
 */
router.put('/:id', authenticate, authorize('admin', 'editor'), updateTitle);

/**
 * @route   DELETE /api/titles/:id
 * @desc    Deletar título
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), deleteTitle);

module.exports = router;
