const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const UserDTO = require('../dtos/UserDTO');

/**
 * Service de Autenticação
 * Responsabilidade: Lógica de negócio de autenticação
 */
class AuthService {
  /**
   * Registrar novo usuário
   */
  async register(userData) {
    const { name, email, password } = userData;

    // Verificar se email já existe
    const emailExists = await UserRepository.emailExists(email);
    if (emailExists) {
      const error = new Error('Email já cadastrado');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    // SEGURANÇA: Sempre forçar role 'reader' no registro público
    const role = 'reader';

    // Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const user = await UserRepository.create({
      name,
      email,
      passwordHash,
      role
    });

    return UserDTO.toPublic(user);
  }

  /**
   * Fazer login
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Buscar usuário com senha
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Gerar token JWT
    const token = this.generateToken(user);

    return UserDTO.toAuthResponse(user, token);
  }

  /**
   * Obter informações do usuário autenticado
   */
  async getAuthenticatedUser(userId) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return UserDTO.toPublic(user);
  }

  /**
   * Gerar token JWT
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verificar token JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      const err = new Error('Token inválido ou expirado');
      err.statusCode = 401;
      err.code = 'INVALID_TOKEN';
      throw err;
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(userId, updateData) {
    // Não permitir alteração de role ou email via este método
    const allowedFields = ['name'];
    const sanitizedData = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    });

    if (Object.keys(sanitizedData).length === 0) {
      const error = new Error('Nenhum campo válido para atualização');
      error.statusCode = 400;
      error.code = 'NO_VALID_FIELDS';
      throw error;
    }

    const user = await UserRepository.update(userId, sanitizedData);

    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return UserDTO.toPublic(user);
  }

  /**
   * Alterar senha
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Buscar usuário com senha atual
    const user = await UserRepository.findById(userId);
    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Buscar senha atual do banco
    const userWithPassword = await UserRepository.findByEmailWithPassword(user.email);

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Senha atual incorreta');
      error.statusCode = 401;
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    // Hash da nova senha
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await UserRepository.update(userId, { password_hash: passwordHash });

    return { message: 'Senha alterada com sucesso' };
  }
}

module.exports = new AuthService();
