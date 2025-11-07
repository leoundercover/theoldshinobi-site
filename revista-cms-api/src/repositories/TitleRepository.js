const pool = require('../config/database');

/**
 * TitleRepository
 * Camada de acesso a dados para Titles
 */
class TitleRepository {
  /**
   * Buscar todos os títulos
   * @param {number} [publisherId] - Filtrar por editora
   * @returns {Promise<Array>} Lista de títulos
   */
  async findAll(publisherId = null) {
    let query = `
      SELECT t.*, p.name as publisher_name
      FROM titles t
      JOIN publishers p ON t.publisher_id = p.id
    `;
    const params = [];

    if (publisherId) {
      query += ' WHERE t.publisher_id = $1';
      params.push(publisherId);
    }

    query += ' ORDER BY t.name ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Buscar título por ID
   * @param {number} id - ID do título
   * @returns {Promise<Object|undefined>}
   */
  async findById(id) {
    const query = `
      SELECT t.*, p.name as publisher_name
      FROM titles t
      JOIN publishers p ON t.publisher_id = p.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Verificar se combinação de publisher_id + name já existe
   * @param {number} publisherId - ID da editora
   * @param {string} name - Nome do título
   * @param {number} excludeId - ID para excluir da verificação
   * @returns {Promise<boolean>}
   */
  async nameExistsForPublisher(publisherId, name, excludeId = null) {
    let query = 'SELECT EXISTS(SELECT 1 FROM titles WHERE publisher_id = $1 AND name = $2';
    const params = [publisherId, name];

    if (excludeId) {
      query += ' AND id != $3';
      params.push(excludeId);
    }

    query += ')';

    const result = await pool.query(query, params);
    return result.rows[0].exists;
  }

  /**
   * Criar novo título
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create({ publisherId, name, description, coverImageUrl, genre }) {
    const query = `
      INSERT INTO titles (publisher_id, name, description, cover_image_url, genre)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [publisherId, name, description, coverImageUrl, genre]);
    return result.rows[0];
  }

  /**
   * Atualizar título
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object|undefined>}
   */
  async update(id, { publisherId, name, description, coverImageUrl, genre }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (publisherId !== undefined) {
      updates.push(`publisher_id = $${paramCount++}`);
      values.push(publisherId);
    }

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (coverImageUrl !== undefined) {
      updates.push(`cover_image_url = $${paramCount++}`);
      values.push(coverImageUrl);
    }

    if (genre !== undefined) {
      updates.push(`genre = $${paramCount++}`);
      values.push(genre);
    }

    updates.push(`updated_at = NOW()`);

    if (values.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE titles
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Deletar título
   * @param {number} id
   * @returns {Promise<Object|undefined>}
   */
  async delete(id) {
    const query = 'DELETE FROM titles WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Contar edições de um título
   * @param {number} titleId
   * @returns {Promise<number>}
   */
  async countIssues(titleId) {
    const query = 'SELECT COUNT(*) FROM issues WHERE title_id = $1';
    const result = await pool.query(query, [titleId]);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = new TitleRepository();
