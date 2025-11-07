/**
 * DTO para Usuário
 * Remove campos sensíveis e padroniza formato
 */
class UserDTO {
  /**
   * Converte entidade User para DTO público
   */
  static toPublic(user) {
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  /**
   * Converte lista de usuários para DTO
   */
  static toPublicList(users) {
    return users.map(user => this.toPublic(user));
  }

  /**
   * DTO para resposta de autenticação (inclui token)
   */
  static toAuthResponse(user, token) {
    return {
      user: this.toPublic(user),
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
  }

  /**
   * DTO mínimo (apenas ID e nome)
   */
  static toMinimal(user) {
    if (!user) return null;

    return {
      id: user.id,
      name: user.name
    };
  }
}

module.exports = UserDTO;
