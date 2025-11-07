/**
 * Utilitário de Paginação
 */
class PaginationHelper {
  /**
   * Valida e normaliza parâmetros de paginação
   */
  static validateParams(page = 1, limit = 20) {
    const validatedPage = Math.max(parseInt(page) || 1, 1);
    const validatedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    return {
      page: validatedPage,
      limit: validatedLimit,
      offset: (validatedPage - 1) * validatedLimit
    };
  }

  /**
   * Calcula metadados de paginação
   */
  static calculateMeta(page, limit, total) {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };
  }

  /**
   * Gera cláusula SQL de paginação
   */
  static getSQLClause(page, limit) {
    const { offset, limit: validatedLimit } = this.validateParams(page, limit);
    return `LIMIT ${validatedLimit} OFFSET ${offset}`;
  }

  /**
   * Extrai parâmetros de paginação da query
   */
  static fromQuery(query) {
    return this.validateParams(query.page, query.limit);
  }

  /**
   * Cria resposta paginada completa
   */
  static createResponse(data, page, limit, total) {
    const pagination = this.calculateMeta(page, limit, total);

    return {
      data,
      pagination
    };
  }
}

module.exports = PaginationHelper;
