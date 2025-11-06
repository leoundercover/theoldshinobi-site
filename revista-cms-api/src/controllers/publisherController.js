const pool = require('../config/database');

/**
 * Listar todas as editoras
 */
const getAllPublishers = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM publishers ORDER BY name ASC');
    res.json({ publishers: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter uma editora por ID
 */
const getPublisherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM publishers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Editora não encontrada' });
    }

    res.json({ publisher: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Criar uma nova editora (apenas admin)
 */
const createPublisher = async (req, res, next) => {
  try {
    const { name, description, logo_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da editora é obrigatório' });
    }

    const result = await pool.query(
      'INSERT INTO publishers (name, description, logo_url) VALUES ($1, $2, $3) RETURNING *',
      [name, description, logo_url]
    );

    res.status(201).json({
      message: 'Editora criada com sucesso',
      publisher: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      // Violação de constraint UNIQUE
      return res.status(409).json({ error: 'Já existe uma editora com este nome' });
    }
    next(error);
  }
};

/**
 * Atualizar uma editora (apenas admin)
 */
const updatePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, logo_url } = req.body;

    const result = await pool.query(
      'UPDATE publishers SET name = COALESCE($1, name), description = COALESCE($2, description), logo_url = COALESCE($3, logo_url), updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, description, logo_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Editora não encontrada' });
    }

    res.json({
      message: 'Editora atualizada com sucesso',
      publisher: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletar uma editora (apenas admin)
 */
const deletePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM publishers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Editora não encontrada' });
    }

    res.json({ message: 'Editora deletada com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
};
