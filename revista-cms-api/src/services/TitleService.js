const TitleRepository = require('../repositories/TitleRepository');
const PublisherRepository = require('../repositories/PublisherRepository');
const { AppError } = require('../middleware/errorHandler');

/**
 * TitleService
 * Camada de lógica de negócio para Titles
 */
class TitleService {
  /**
   * Listar todos os títulos
   * @param {number} [publisherId] - Filtrar por editora
   * @returns {Promise<Array>}
   */
  async getAllTitles(publisherId = null) {
    // Se publisherId fornecido, validar que existe
    if (publisherId) {
      const id = parseInt(publisherId, 10);
      if (isNaN(id) || id <= 0) {
        throw new AppError('Publisher ID inválido', 400, 'INVALID_PUBLISHER_ID');
      }

      const publisherExists = await PublisherRepository.findById(id);
      if (!publisherExists) {
        throw new AppError('Editora não encontrada', 404, 'PUBLISHER_NOT_FOUND');
      }

      return await TitleRepository.findAll(id);
    }

    return await TitleRepository.findAll();
  }

  /**
   * Obter título por ID
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getTitleById(id) {
    const titleId = parseInt(id, 10);
    if (isNaN(titleId) || titleId <= 0) {
      throw new AppError('ID inválido', 400, 'INVALID_ID');
    }

    const title = await TitleRepository.findById(titleId);

    if (!title) {
      throw new AppError('Título não encontrado', 404, 'TITLE_NOT_FOUND');
    }

    return title;
  }

  /**
   * Criar novo título
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createTitle({ publisherId, name, description, coverImageUrl, genre }) {
    // Validar dados obrigatórios
    if (!publisherId) {
      throw new AppError('ID da editora é obrigatório', 400, 'PUBLISHER_ID_REQUIRED');
    }

    if (!name || name.trim() === '') {
      throw new AppError('Nome do título é obrigatório', 400, 'NAME_REQUIRED');
    }

    // Validar publisher_id
    const parsedPublisherId = parseInt(publisherId, 10);
    if (isNaN(parsedPublisherId) || parsedPublisherId <= 0) {
      throw new AppError('Publisher ID inválido', 400, 'INVALID_PUBLISHER_ID');
    }

    // Verificar se editora existe
    const publisherExists = await PublisherRepository.findById(parsedPublisherId);
    if (!publisherExists) {
      throw new AppError('Editora não encontrada', 404, 'PUBLISHER_NOT_FOUND');
    }

    // Verificar se já existe título com mesmo nome para essa editora
    const nameExists = await TitleRepository.nameExistsForPublisher(
      parsedPublisherId,
      name.trim()
    );
    if (nameExists) {
      throw new AppError(
        'Já existe um título com este nome para esta editora',
        409,
        'DUPLICATE_TITLE'
      );
    }

    // Criar título
    const title = await TitleRepository.create({
      publisherId: parsedPublisherId,
      name: name.trim(),
      description: description?.trim(),
      coverImageUrl: coverImageUrl?.trim(),
      genre: genre?.trim(),
    });

    return title;
  }

  /**
   * Atualizar título
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateTitle(id, { publisherId, name, description, coverImageUrl, genre }) {
    const titleId = parseInt(id, 10);
    if (isNaN(titleId) || titleId <= 0) {
      throw new AppError('ID inválido', 400, 'INVALID_ID');
    }

    // Verificar se título existe
    const title = await TitleRepository.findById(titleId);
    if (!title) {
      throw new AppError('Título não encontrado', 404, 'TITLE_NOT_FOUND');
    }

    // Se mudando publisherId, verificar que existe
    if (publisherId && publisherId !== title.publisher_id) {
      const parsedPublisherId = parseInt(publisherId, 10);
      if (isNaN(parsedPublisherId) || parsedPublisherId <= 0) {
        throw new AppError('Publisher ID inválido', 400, 'INVALID_PUBLISHER_ID');
      }

      const publisherExists = await PublisherRepository.findById(parsedPublisherId);
      if (!publisherExists) {
        throw new AppError('Editora não encontrada', 404, 'PUBLISHER_NOT_FOUND');
      }
    }

    // Se mudando o nome, verificar duplicatas
    if (name && name.trim() !== title.name) {
      const checkPublisherId = publisherId ? parseInt(publisherId, 10) : title.publisher_id;
      const nameExists = await TitleRepository.nameExistsForPublisher(
        checkPublisherId,
        name.trim(),
        titleId
      );
      if (nameExists) {
        throw new AppError(
          'Já existe um título com este nome para esta editora',
          409,
          'DUPLICATE_TITLE'
        );
      }
    }

    // Atualizar título
    const updated = await TitleRepository.update(titleId, {
      publisherId: publisherId ? parseInt(publisherId, 10) : undefined,
      name: name?.trim(),
      description: description?.trim(),
      coverImageUrl: coverImageUrl?.trim(),
      genre: genre?.trim(),
    });

    return updated;
  }

  /**
   * Deletar título
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteTitle(id) {
    const titleId = parseInt(id, 10);
    if (isNaN(titleId) || titleId <= 0) {
      throw new AppError('ID inválido', 400, 'INVALID_ID');
    }

    const title = await TitleRepository.findById(titleId);
    if (!title) {
      throw new AppError('Título não encontrado', 404, 'TITLE_NOT_FOUND');
    }

    // Verificar se há edições associadas
    const issuesCount = await TitleRepository.countIssues(titleId);
    if (issuesCount > 0) {
      throw new AppError(
        `Não é possível deletar este título pois ele possui ${issuesCount} edição(ões) associada(s)`,
        409,
        'HAS_ASSOCIATED_ISSUES'
      );
    }

    await TitleRepository.delete(titleId);
  }
}

module.exports = new TitleService();
