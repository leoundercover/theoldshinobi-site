const express = require('express');
const {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher
} = require('../controllers/publisherController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/publishers
 * @desc    Listar todas as editoras
 * @access  Public
 */
router.get('/', getAllPublishers);

/**
 * @route   GET /api/publishers/:id
 * @desc    Obter uma editora por ID
 * @access  Public
 */
router.get('/:id', getPublisherById);

/**
 * @route   POST /api/publishers
 * @desc    Criar nova editora
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('admin'), createPublisher);

/**
 * @route   PUT /api/publishers/:id
 * @desc    Atualizar editora
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, authorize('admin'), updatePublisher);

/**
 * @route   DELETE /api/publishers/:id
 * @desc    Deletar editora
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), deletePublisher);

module.exports = router;
