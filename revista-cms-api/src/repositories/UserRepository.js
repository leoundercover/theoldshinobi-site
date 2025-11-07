const pool = require('../config/database');

/**
 * Repository para operações de banco de dados relacionadas a Usuários
 * Responsabilidade: Acesso a dados, queries SQL
 */
class UserRepository {
  /**
   * Buscar usuário por ID
   */
  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Buscar usuário por email
   */
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  /**
   * Criar novo usuário
   */
  async create(userData) {
    const { name, email, passwordHash, role } = userData;

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, passwordHash, role]
    );

    return result.rows[0];
  }

  /**
   * Atualizar usuário
   */
  async update(id, userData) {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    // Construir query dinamicamente baseado nos campos fornecidos
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
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
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Deletar usuário
   */
  async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Listar todos os usuários com paginação
   */
  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, name, email, role, created_at, updated_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Contar total
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    return {
      users: result.rows,
      total
    };
  }

  /**
   * Verificar se email já existe
   */
  async emailExists(email) {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email]
    );
    return result.rows[0].exists;
  }

  /**
   * Contar usuários por role
   */
  async countByRole(role) {
    const result = await pool.query(
      'SELECT COUNT(*) FROM users WHERE role = $1',
      [role]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Buscar usuário com senha (para autenticação)
   */
  async findByEmailWithPassword(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }
}

module.exports = new UserRepository();
