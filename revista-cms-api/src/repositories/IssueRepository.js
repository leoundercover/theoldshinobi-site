const pool = require('../config/database');

/**
 * Repository para operações de banco de dados relacionadas a Issues (Edições)
 */
class IssueRepository {
  /**
   * Buscar issue por ID com informações completas
   */
  async findById(id) {
    const result = await pool.query(
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
    return result.rows[0];
  }

  /**
   * Buscar todas as issues com filtros e paginação
   */
  async findAll(filters = {}, pagination = {}) {
    const { titleId, publicationYear } = filters;
    const { limit, offset } = pagination;

    let query = `
      SELECT i.*, t.name as title_name, p.name as publisher_name,
             COALESCE(AVG(r.value), 0) as average_rating,
             COUNT(DISTINCT r.id) as rating_count
      FROM issues i
      JOIN titles t ON i.title_id = t.id
      JOIN publishers p ON t.publisher_id = p.id
      LEFT JOIN ratings r ON i.id = r.issue_id
    `;

    const conditions = [];
    const params = [];
    let paramCounter = 1;

    if (titleId) {
      conditions.push(`i.title_id = $${paramCounter}`);
      params.push(titleId);
      paramCounter++;
    }

    if (publicationYear) {
      conditions.push(`i.publication_year = $${paramCounter}`);
      params.push(publicationYear);
      paramCounter++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY i.id, t.name, p.name
      ORDER BY i.publication_year DESC, i.issue_number DESC
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total com os mesmos filtros
    let countQuery = 'SELECT COUNT(DISTINCT i.id) FROM issues i';

    if (titleId || publicationYear) {
      countQuery += ' JOIN titles t ON i.title_id = t.id';
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
    }

    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    return {
      issues: result.rows,
      total
    };
  }

  /**
   * Criar nova issue
   */
  async create(issueData) {
    const {
      titleId,
      issueNumber,
      publicationYear,
      description,
      coverImageUrl,
      pdfFileUrl,
      pageCount,
      author,
      artist
    } = issueData;

    const result = await pool.query(
      `INSERT INTO issues
       (title_id, issue_number, publication_year, description, cover_image_url,
        pdf_file_url, page_count, author, artist)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [titleId, issueNumber, publicationYear, description, coverImageUrl,
       pdfFileUrl, pageCount, author, artist]
    );

    return result.rows[0];
  }

  /**
   * Atualizar issue
   */
  async update(id, issueData) {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    const fieldMapping = {
      titleId: 'title_id',
      issueNumber: 'issue_number',
      publicationYear: 'publication_year',
      description: 'description',
      coverImageUrl: 'cover_image_url',
      pdfFileUrl: 'pdf_file_url',
      pageCount: 'page_count',
      author: 'author',
      artist: 'artist'
    };

    Object.entries(issueData).forEach(([key, value]) => {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE issues
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Deletar issue
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM issues WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Buscar issues similares (mesmo gênero ou mesma série)
   */
  async findSimilar(issueId, limit = 4) {
    const result = await pool.query(
      `SELECT i.id, i.issue_number, i.cover_image_url, t.name as title_name,
              COALESCE(AVG(r.value), 0) as average_rating
       FROM issues i
       JOIN titles t ON i.title_id = t.id
       LEFT JOIN ratings r ON i.id = r.issue_id
       WHERE (t.genre = (SELECT t2.genre FROM issues i2 JOIN titles t2 ON i2.title_id = t2.id WHERE i2.id = $1)
              OR t.id = (SELECT title_id FROM issues WHERE id = $1))
         AND i.id != $1
       GROUP BY i.id, t.name
       ORDER BY RANDOM()
       LIMIT $2`,
      [issueId, limit]
    );

    return result.rows;
  }

  /**
   * Buscar issues por termo de busca
   */
  async search(searchTerm, limit = 20) {
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
      [`%${searchTerm}%`, limit]
    );

    return result.rows;
  }

  /**
   * Verificar se issue existe
   */
  async exists(id) {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM issues WHERE id = $1)',
      [id]
    );
    return result.rows[0].exists;
  }

  /**
   * Verificar duplicata (mesmo title_id e issue_number)
   */
  async isDuplicate(titleId, issueNumber, excludeId = null) {
    let query = 'SELECT EXISTS(SELECT 1 FROM issues WHERE title_id = $1 AND issue_number = $2';
    const params = [titleId, issueNumber];

    if (excludeId) {
      query += ' AND id != $3';
      params.push(excludeId);
    }

    query += ')';

    const result = await pool.query(query, params);
    return result.rows[0].exists;
  }

  /**
   * Contar issues por title
   */
  async countByTitle(titleId) {
    const result = await pool.query(
      'SELECT COUNT(*) FROM issues WHERE title_id = $1',
      [titleId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = new IssueRepository();
