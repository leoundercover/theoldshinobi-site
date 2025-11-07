const pool = require('../config/database');

/**
 * PublisherRepository
 * Camada de acesso a dados para Publishers
 * Segue padrão Repository do Clean Architecture
 */
class PublisherRepository {
  /**
   * Buscar todas as editoras
   * @returns {Promise<Array>} Lista de editoras
   */
  async findAll() {
    const query = 'SELECT * FROM publishers ORDER BY name ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Buscar editora por ID
   * @param {number} id - ID da editora
   * @returns {Promise<Object|undefined>} Editora encontrada ou undefined
   */
  async findById(id) {
    const query = 'SELECT * FROM publishers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar editora por nome exato
   * @param {string} name - Nome da editora
   * @returns {Promise<Object|undefined>} Editora encontrada ou undefined
   */
  async findByName(name) {
    const query = 'SELECT * FROM publishers WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  /**
   * Verificar se nome já existe
   * @param {string} name - Nome a verificar
   * @param {number} excludeId - ID para excluir da verificação (para updates)
   * @returns {Promise<boolean>} true se existe, false caso contrário
   */
  async nameExists(name, excludeId = null) {
    let query = 'SELECT EXISTS(SELECT 1 FROM publishers WHERE name = $1';
    const params = [name];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    query += ')';

    const result = await pool.query(query, params);
    return result.rows[0].exists;
  }

  /**
   * Criar nova editora
   * @param {Object} data - Dados da editora
   * @param {string} data.name - Nome da editora
   * @param {string} [data.description] - Descrição
   * @param {string} [data.logoUrl] - URL do logo
   * @returns {Promise<Object>} Editora criada
   */
  async create({ name, description, logoUrl }) {
    const query = `
      INSERT INTO publishers (name, description, logo_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [name, description, logoUrl]);
    return result.rows[0];
  }

  /**
   * Atualizar editora
   * @param {number} id - ID da editora
   * @param {Object} data - Dados para atualizar
   * @param {string} [data.name] - Nome
   * @param {string} [data.description] - Descrição
   * @param {string} [data.logoUrl] - URL do logo
   * @returns {Promise<Object|undefined>} Editora atualizada ou undefined
   */
  async update(id, { name, description, logoUrl }) {
    // Construir query dinâmica baseado nos campos fornecidos
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (logoUrl !== undefined) {
      updates.push(`logo_url = $${paramCount++}`);
      values.push(logoUrl);
    }

    // Sempre atualizar updated_at
    updates.push(`updated_at = NOW()`);

    // Se não há campos para atualizar, retornar o registro atual
    if (values.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE publishers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Deletar editora
   * @param {number} id - ID da editora
   * @returns {Promise<Object|undefined>} Editora deletada ou undefined
   */
  async delete(id) {
    const query = 'DELETE FROM publishers WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Contar total de editoras
   * @returns {Promise<number>} Total de editoras
   */
  async count() {
    const query = 'SELECT COUNT(*) FROM publishers';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Contar títulos de uma editora
   * @param {number} publisherId - ID da editora
   * @returns {Promise<number>} Total de títulos
   */
  async countTitles(publisherId) {
    const query = 'SELECT COUNT(*) FROM titles WHERE publisher_id = $1';
    const result = await pool.query(query, [publisherId]);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = new PublisherRepository();
