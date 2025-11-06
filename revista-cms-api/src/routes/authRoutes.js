const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 * @security Rate limited: 5 tentativas por 15 minutos
 */
router.post('/register', authLimiter, registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 * @security Rate limited: 5 tentativas por 15 minutos
 */
router.post('/login', authLimiter, loginValidation, login);

/**
 * @route   GET /api/auth/me
 * @desc    Obter informações do usuário autenticado
 * @access  Private
 */
router.get('/me', authenticate, getMe);

module.exports = router;
