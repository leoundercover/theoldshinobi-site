const pool = require('../config/database');

/**
 * Listar todos os títulos (com filtro opcional por editora)
 */
const getAllTitles = async (req, res, next) => {
  try {
    const { publisher_id } = req.query;

    let query = `
      SELECT t.*, p.name as publisher_name 
      FROM titles t 
      JOIN publishers p ON t.publisher_id = p.id
    `;
    const params = [];

    if (publisher_id) {
      query += ' WHERE t.publisher_id = $1';
      params.push(publisher_id);
    }

    query += ' ORDER BY t.name ASC';

    const result = await pool.query(query, params);
    res.json({ titles: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter um título por ID
 */
const getTitleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*, p.name as publisher_name 
       FROM titles t 
       JOIN publishers p ON t.publisher_id = p.id 
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Título não encontrado' });
    }

    res.json({ title: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Criar um novo título (admin/editor)
 */
const createTitle = async (req, res, next) => {
  try {
    const { publisher_id, name, description, cover_image_url, genre } = req.body;

    if (!publisher_id || !name) {
      return res.status(400).json({ error: 'ID da editora e nome do título são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO titles (publisher_id, name, description, cover_image_url, genre) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [publisher_id, name, description, cover_image_url, genre]
    );

    res.status(201).json({
      message: 'Título criado com sucesso',
      title: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      // Violação de foreign key
      return res.status(400).json({ error: 'Editora não encontrada' });
    }
    next(error);
  }
};

/**
 * Atualizar um título (admin/editor)
 */
const updateTitle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { publisher_id, name, description, cover_image_url, genre } = req.body;

    const result = await pool.query(
      `UPDATE titles 
       SET publisher_id = COALESCE($1, publisher_id), 
           name = COALESCE($2, name), 
           description = COALESCE($3, description), 
           cover_image_url = COALESCE($4, cover_image_url), 
           genre = COALESCE($5, genre), 
           updated_at = NOW() 
       WHERE id = $6 
       RETURNING *`,
      [publisher_id, name, description, cover_image_url, genre, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Título não encontrado' });
    }

    res.json({
      message: 'Título atualizado com sucesso',
      title: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletar um título (admin)
 */
const deleteTitle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM titles WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Título não encontrado' });
    }

    res.json({ message: 'Título deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTitles,
  getTitleById,
  createTitle,
  updateTitle,
  deleteTitle,
};
