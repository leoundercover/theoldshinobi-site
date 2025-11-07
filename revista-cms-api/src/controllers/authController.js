const AuthService = require('../services/AuthService');
const ResponseDTO = require('../dtos/ResponseDTO');

/**
 * Controller de Autenticação
 * Responsabilidade: Receber requisições HTTP, chamar services, retornar respostas
 */

/**
 * Registrar um novo usuário
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await AuthService.register({ name, email, password });

    const response = ResponseDTO.created(user, 'Usuário registrado com sucesso');
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Login de usuário
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const authData = await AuthService.login({ email, password });

    const response = ResponseDTO.success(authData, 'Login realizado com sucesso');
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Obter informações do usuário autenticado
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await AuthService.getAuthenticatedUser(userId);

    const response = ResponseDTO.success(user);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Atualizar perfil do usuário autenticado
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await AuthService.updateProfile(userId, updateData);

    const response = ResponseDTO.updated(user, 'Perfil atualizado com sucesso');
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Alterar senha do usuário autenticado
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const result = await AuthService.changePassword(userId, currentPassword, newPassword);

    const response = ResponseDTO.success(null, result.message);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
