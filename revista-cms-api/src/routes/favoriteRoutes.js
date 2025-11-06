const express = require('express');
const {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite,
} = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/favorites
 * @desc    Listar favoritos do usuário
 * @access  Private
 */
router.get('/', authenticate, getUserFavorites);

/**
 * @route   POST /api/favorites/:issue_id
 * @desc    Adicionar edição aos favoritos
 * @access  Private
 */
router.post('/:issue_id', authenticate, addFavorite);

/**
 * @route   DELETE /api/favorites/:issue_id
 * @desc    Remover edição dos favoritos
 * @access  Private
 */
router.delete('/:issue_id', authenticate, removeFavorite);

/**
 * @route   GET /api/favorites/:issue_id/check
 * @desc    Verificar se edição está nos favoritos
 * @access  Private
 */
router.get('/:issue_id/check', authenticate, checkFavorite);

module.exports = router;
