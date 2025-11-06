const pool = require('../config/database');

/**
 * Listar todas as edições (com filtros opcionais)
 */
const getAllIssues = async (req, res, next) => {
  try {
    const { title_id, publication_year, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT i.*, t.name as title_name, p.name as publisher_name,
             COALESCE(AVG(r.value), 0) as average_rating,
             COUNT(DISTINCT r.id) as rating_count
      FROM issues i
      JOIN titles t ON i.title_id = t.id
      JOIN publishers p ON t.publisher_id = p.id
      LEFT JOIN ratings r ON i.id = r.issue_id
    `;

    const params = [];
    const conditions = [];

    if (title_id) {
      conditions.push(`i.title_id = $${params.length + 1}`);
      params.push(title_id);
    }

    if (publication_year) {
      conditions.push(`i.publication_year = $${params.length + 1}`);
      params.push(publication_year);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` 
      GROUP BY i.id, t.name, p.name
      ORDER BY i.publication_year DESC, i.issue_number DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ issues: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter uma edição por ID (com avaliação média e títulos similares)
 */
const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Buscar a edição com informações agregadas
    const issueResult = await pool.query(
      `SELECT i.*, t.name as title_name, t.genre, p.name as publisher_name,
              COALESCE(AVG(r.value), 0) as average_rating,
              COUNT(DISTINCT r.id) as rating_count
       FROM issues i
       JOIN titles t ON i.title_id = t.id
       JOIN publishers p ON t.publisher_id = p.id
       LEFT JOIN ratings r ON i.id = r.issue_id
       WHERE i.id = $1
       GROUP BY i.id, t.name, t.genre, p.name`,
      [id]
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Edição não encontrada' });
    }

    const issue = issueResult.rows[0];

    // Buscar títulos similares (mesmo gênero ou mesma série)
    const similarResult = await pool.query(
      `SELECT i.id, i.issue_number, i.cover_image_url, t.name as title_name,
              COALESCE(AVG(r.value), 0) as average_rating
       FROM issues i
       JOIN titles t ON i.title_id = t.id
       LEFT JOIN ratings r ON i.id = r.issue_id
       WHERE (t.genre = $1 OR t.id = $2) AND i.id != $3
       GROUP BY i.id, t.name
       ORDER BY RANDOM()
       LIMIT 4`,
      [issue.genre, issue.title_id, id]
    );

    res.json({
      issue,
      similar_issues: similarResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Criar uma nova edição (admin/editor)
 */
const createIssue = async (req, res, next) => {
  try {
    const {
      title_id,
      issue_number,
      publication_year,
      description,
      cover_image_url,
      pdf_file_url,
      page_count,
      author,
      artist,
    } = req.body;

    if (!title_id || !issue_number || !cover_image_url || !pdf_file_url) {
      return res.status(400).json({
        error: 'ID do título, número da edição, capa e PDF são obrigatórios',
      });
    }

    const result = await pool.query(
      `INSERT INTO issues 
       (title_id, issue_number, publication_year, description, cover_image_url, pdf_file_url, page_count, author, artist) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        title_id,
        issue_number,
        publication_year,
        description,
        cover_image_url,
        pdf_file_url,
        page_count,
        author,
        artist,
      ]
    );

    res.status(201).json({
      message: 'Edição criada com sucesso',
      issue: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Esta edição já existe para este título' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Título não encontrado' });
    }
    next(error);
  }
};

/**
 * Atualizar uma edição (admin/editor)
 */
const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title_id,
      issue_number,
      publication_year,
      description,
      cover_image_url,
      pdf_file_url,
      page_count,
      author,
      artist,
    } = req.body;

    const result = await pool.query(
      `UPDATE issues 
       SET title_id = COALESCE($1, title_id),
           issue_number = COALESCE($2, issue_number),
           publication_year = COALESCE($3, publication_year),
           description = COALESCE($4, description),
           cover_image_url = COALESCE($5, cover_image_url),
           pdf_file_url = COALESCE($6, pdf_file_url),
           page_count = COALESCE($7, page_count),
           author = COALESCE($8, author),
           artist = COALESCE($9, artist),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title_id,
        issue_number,
        publication_year,
        description,
        cover_image_url,
        pdf_file_url,
        page_count,
        author,
        artist,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Edição não encontrada' });
    }

    res.json({
      message: 'Edição atualizada com sucesso',
      issue: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletar uma edição (admin)
 */
const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM issues WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Edição não encontrada' });
    }

    res.json({ message: 'Edição deletada com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * Buscar edições (busca global)
 */
const searchIssues = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório' });
    }

    const result = await pool.query(
      `SELECT i.*, t.name as title_name, p.name as publisher_name,
              COALESCE(AVG(r.value), 0) as average_rating
       FROM issues i
       JOIN titles t ON i.title_id = t.id
       JOIN publishers p ON t.publisher_id = p.id
       LEFT JOIN ratings r ON i.id = r.issue_id
       WHERE 
         t.name ILIKE $1 OR 
         p.name ILIKE $1 OR 
         i.description ILIKE $1 OR
         i.author ILIKE $1 OR
         i.artist ILIKE $1
       GROUP BY i.id, t.name, p.name
       ORDER BY i.publication_year DESC
       LIMIT $2`,
      [`%${q}%`, limit]
    );

    res.json({ issues: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  searchIssues,
};
