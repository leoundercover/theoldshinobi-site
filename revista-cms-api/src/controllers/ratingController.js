const pool = require('../config/database');

/**
 * Adicionar ou atualizar avaliação de uma edição
 */
const rateIssue = async (req, res, next) => {
  try {
    const { issue_id } = req.params;
    const { value } = req.body;
    const user_id = req.user.id;

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5' });
    }

    // Verificar se a edição existe
    const issueCheck = await pool.query('SELECT id FROM issues WHERE id = $1', [issue_id]);
    if (issueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Edição não encontrada' });
    }

    // Tentar inserir ou atualizar a avaliação
    const result = await pool.query(
      `INSERT INTO ratings (user_id, issue_id, value) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, issue_id) 
       DO UPDATE SET value = $3, created_at = NOW()
       RETURNING *`,
      [user_id, issue_id, value]
    );

    res.status(201).json({
      message: 'Avaliação registrada com sucesso',
      rating: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter avaliações de uma edição
 */
const getIssueRatings = async (req, res, next) => {
  try {
    const { issue_id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as user_name 
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.issue_id = $1
       ORDER BY r.created_at DESC`,
      [issue_id]
    );

    res.json({ ratings: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Adicionar um comentário a uma edição
 */
const addComment = async (req, res, next) => {
  try {
    const { issue_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' });
    }

    // Verificar se a edição existe
    const issueCheck = await pool.query('SELECT id FROM issues WHERE id = $1', [issue_id]);
    if (issueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Edição não encontrada' });
    }

    const result = await pool.query(
      'INSERT INTO comments (user_id, issue_id, content) VALUES ($1, $2, $3) RETURNING *',
      [user_id, issue_id, content]
    );

    res.status(201).json({
      message: 'Comentário adicionado com sucesso',
      comment: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter comentários de uma edição
 */
const getIssueComments = async (req, res, next) => {
  try {
    const { issue_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT c.*, u.name as user_name 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.issue_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [issue_id, limit, offset]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletar um comentário (apenas o autor ou admin)
 */
const deleteComment = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    // Buscar o comentário
    const commentCheck = await pool.query('SELECT user_id FROM comments WHERE id = $1', [
      comment_id,
    ]);

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    // Verificar permissão (apenas o autor ou admin pode deletar)
    if (commentCheck.rows[0].user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ error: 'Você não tem permissão para deletar este comentário' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [comment_id]);

    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  rateIssue,
  getIssueRatings,
  addComment,
  getIssueComments,
  deleteComment,
};
