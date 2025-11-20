const bcrypt = require('bcryptjs');
const ResponseDTO = require('../dtos/ResponseDTO');
const UserRepository = require('../repositories/UserRepository');

const ALLOWED_ROLES = ['admin', 'editor', 'reader'];

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
  return { page, limit };
};

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req);
    const { users, total } = await UserRepository.findAll(page, limit);
    const response = ResponseDTO.paginated(users, { page, limit, total });
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserRepository.findById(id);
    if (!user) {
      return res.status(404).json(ResponseDTO.error('Usuário não encontrado', 'NOT_FOUND', null, 404));
    }
    res.json(ResponseDTO.success(user));
  } catch (error) {
    next(error);
  }
};

// POST /api/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json(ResponseDTO.error('Nome, email, senha e role são obrigatórios', 'VALIDATION_ERROR', null, 400));
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json(ResponseDTO.error('Role inválida', 'VALIDATION_ERROR', null, 400));
    }

    const emailExists = await UserRepository.emailExists(email);
    if (emailExists) {
      return res.status(400).json(ResponseDTO.error('Email já cadastrado', 'EMAIL_IN_USE', null, 400));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await UserRepository.create({ name, email, passwordHash, role });

    res.status(201).json(ResponseDTO.created(user, 'Usuário criado com sucesso'));
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const current = await UserRepository.findById(id);
    if (!current) {
      return res.status(404).json(ResponseDTO.error('Usuário não encontrado', 'NOT_FOUND', null, 404));
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      if (email !== current.email) {
        const emailExists = await UserRepository.emailExists(email);
        if (emailExists) {
          return res.status(400).json(ResponseDTO.error('Email já cadastrado', 'EMAIL_IN_USE', null, 400));
        }
      }
      updateData.email = email;
    }
    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json(ResponseDTO.error('Role inválida', 'VALIDATION_ERROR', null, 400));
      }
      updateData.role = role;
    }
    if (password !== undefined && password !== '') {
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const updated = await UserRepository.update(id, updateData);

    res.json(ResponseDTO.updated(updated, 'Usuário atualizado com sucesso'));
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await UserRepository.delete(id);
    if (!deleted) {
      return res.status(404).json(ResponseDTO.error('Usuário não encontrado', 'NOT_FOUND', null, 404));
    }
    res.json(ResponseDTO.deleted('Usuário deletado com sucesso'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

