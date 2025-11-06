const express = require('express');
const {
  rateIssue,
  getIssueRatings,
  addComment,
  getIssueComments,
  deleteComment,
} = require('../controllers/ratingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/issues/:issue_id/rate
 * @desc    Avaliar uma edição
 * @access  Private
 */
router.post('/:issue_id/rate', authenticate, rateIssue);

/**
 * @route   GET /api/issues/:issue_id/ratings
 * @desc    Obter avaliações de uma edição
 * @access  Public
 */
router.get('/:issue_id/ratings', getIssueRatings);

/**
 * @route   POST /api/issues/:issue_id/comments
 * @desc    Adicionar comentário a uma edição
 * @access  Private
 */
router.post('/:issue_id/comments', authenticate, addComment);

/**
 * @route   GET /api/issues/:issue_id/comments
 * @desc    Obter comentários de uma edição
 * @access  Public
 */
router.get('/:issue_id/comments', getIssueComments);

/**
 * @route   DELETE /api/comments/:comment_id
 * @desc    Deletar um comentário
 * @access  Private (Autor ou Admin)
 */
router.delete('/comments/:comment_id', authenticate, deleteComment);

module.exports = router;
