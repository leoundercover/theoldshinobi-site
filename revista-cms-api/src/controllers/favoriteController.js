const pool = require('../config/database');

/**
 * Adicionar uma edição aos favoritos
 */
const addFavorite = async (req, res, next) => {
  try {
    const { issue_id } = req.params;
    const user_id = req.user.id;

    // Verificar se a edição existe
    const issueCheck = await pool.query('SELECT id FROM issues WHERE id = $1', [issue_id]);
    if (issueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Edição não encontrada' });
    }

    // Adicionar aos favoritos (ignorar se já existir)
    await pool.query(
      'INSERT INTO user_favorites (user_id, issue_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user_id, issue_id]
    );

    res.status(201).json({ message: 'Edição adicionada aos favoritos' });
  } catch (error) {
    next(error);
  }
};

/**
 * Remover uma edição dos favoritos
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { issue_id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND issue_id = $2 RETURNING *',
      [user_id, issue_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorito não encontrado' });
    }

    res.json({ message: 'Edição removida dos favoritos' });
  } catch (error) {
    next(error);
  }
};

/**
 * Listar todos os favoritos do usuário
 */
const getUserFavorites = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT i.*, t.name as title_name, p.name as publisher_name,
              COALESCE(AVG(r.rating), 0) as average_rating
       FROM user_favorites uf
       JOIN issues i ON uf.issue_id = i.id
       JOIN titles t ON i.title_id = t.id
       JOIN publishers p ON t.publisher_id = p.id
       LEFT JOIN ratings r ON i.id = r.issue_id
       WHERE uf.user_id = $1
       GROUP BY i.id, t.name, p.name
       ORDER BY uf.created_at DESC`,
      [user_id]
    );

    res.json({ favorites: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Verificar se uma edição está nos favoritos
 */
const checkFavorite = async (req, res, next) => {
  try {
    const { issue_id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'SELECT * FROM user_favorites WHERE user_id = $1 AND issue_id = $2',
      [user_id, issue_id]
    );

    res.json({ is_favorite: result.rows.length > 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite
};
