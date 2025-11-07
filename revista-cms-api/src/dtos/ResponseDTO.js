/**
 * DTO de Resposta Padrão da API
 * Padroniza o formato de todas as respostas
 */
class ResponseDTO {
  /**
   * Resposta de sucesso
   */
  static success(data, message = null, meta = null) {
    const response = {
      success: true,
      data
    };

    if (message) {
      response.message = message;
    }

    if (meta) {
      response.meta = meta;
    }

    return response;
  }

  /**
   * Resposta de erro
   */
  static error(message, code = 'ERROR', details = null, statusCode = 500) {
    const response = {
      success: false,
      error: {
        code,
        message
      }
    };

    if (details) {
      response.error.details = details;
    }

    response.statusCode = statusCode;

    return response;
  }

  /**
   * Resposta com paginação
   */
  static paginated(data, pagination) {
    return {
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrevPage: pagination.page > 1
      }
    };
  }

  /**
   * Resposta de lista
   */
  static list(items, message = null) {
    return {
      success: true,
      data: items,
      count: items.length,
      message
    };
  }

  /**
   * Resposta de criação
   */
  static created(data, message = 'Recurso criado com sucesso') {
    return {
      success: true,
      message,
      data
    };
  }

  /**
   * Resposta de atualização
   */
  static updated(data, message = 'Recurso atualizado com sucesso') {
    return {
      success: true,
      message,
      data
    };
  }

  /**
   * Resposta de deleção
   */
  static deleted(message = 'Recurso deletado com sucesso') {
    return {
      success: true,
      message
    };
  }

  /**
   * Resposta sem conteúdo
   */
  static noContent() {
    return {
      success: true
    };
  }
}

module.exports = ResponseDTO;
