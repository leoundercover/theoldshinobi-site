const PublisherRepository = require('../repositories/PublisherRepository');
const { AppError } = require('../middleware/errorHandler');

/**
 * PublisherService
 * Camada de lógica de negócio para Publishers
 * Segue padrão Service do Clean Architecture
 */
class PublisherService {
  /**
   * Listar todas as editoras
   * @returns {Promise<Array>} Lista de editoras ordenadas por nome
   */
  async getAllPublishers() {
    return await PublisherRepository.findAll();
  }

  /**
   * Obter editora por ID
   * @param {number} id - ID da editora
   * @returns {Promise<Object>} Editora encontrada
   * @throws {AppError} Se editora não for encontrada
   */
  async getPublisherById(id) {
    // Validar ID
    const publisherId = parseInt(id, 10);
    if (isNaN(publisherId) || publisherId <= 0) {
      throw new AppError('ID inválido', 400, 'INVALID_ID');
    }

    const publisher = await PublisherRepository.findById(publisherId);

    if (!publisher) {
      throw new AppError('Editora não encontrada', 404, 'PUBLISHER_NOT_FOUND');
    }

    return publisher;
  }

  /**
   * Criar nova editora
   * @param {Object} data - Dados da editora
   * @param {string} data.name - Nome da editora (obrigatório)
   * @param {string} [data.description] - Descrição
   * @param {string} [data.logoUrl] - URL do logo
   * @returns {Promise<Object>} Editora criada
   * @throws {AppError} Se nome não fornecido ou já existir
   */
  async createPublisher({ name, description, logoUrl }) {
    // Validar dados obrigatórios
    if (!name || name.trim() === '') {
      throw new AppError('Nome da editora é obrigatório', 400, 'NAME_REQUIRED');
    }

    // Verificar se nome já existe
    const nameExists = await PublisherRepository.nameExists(name.trim());
    if (nameExists) {
      throw new AppError('Já existe uma editora com este nome', 409, 'DUPLICATE_NAME');
    }

    // Criar editora
    const publisher = await PublisherRepository.create({
      name: name.trim(),
      description: description?.trim(),
      logoUrl: logoUrl?.trim()
    });

    return publisher;
  }

  /**
   * Atualizar editora
   * @param {number} id - ID da editora
   * @param {Object} data - Dados para atualizar
   * @param {string} [data.name] - Nome
   * @param {string} [data.description] - Descrição
   * @param {string} [data.logoUrl] - URL do logo
   * @returns {Promise<Object>} Editora atualizada
   * @throws {AppError} Se editora não existir ou nome duplicado
   */
  async updatePublisher(id, { name, description, logoUrl }) {
    // Validar ID
    const publisherId = parseInt(id, 10);
    if (isNaN(publisherId) || publisherId <= 0) {
      throw new AppError('ID inválido', 400, 'INVALID_ID');
    }

    // Verificar se editora existe
    const publisher = await PublisherRepository.findById(publisherId);
    if (!publisher) {
      throw new AppError('Editora não encontrada', 404, 'PUBLISHER_NOT_FOUND');
    }

    // Se está alterando o nome, verificar duplicatas
    if (name && name.trim() !== publisher.name) {
      const nameExists = await PublisherRepository.nameExists(name.trim(), publisherId);
      if (nameExists) {
        throw new AppError('Já existe uma editora com este nome', 409, 'DUPLICATE_NAME');
      }
    }

    // Atualizar editora
    const updated = await PublisherRepository.update(publisherId, {
      name: name?.trim(),
      description: description?.trim(),
      logoUrl: logoUrl?.trim()
    });

    return updated;
  }

  /**
   * Deletar editora
   * @param {number} id - ID da editora
   * @returns {Promise<void>}
   * @throws {AppError} Se editora não existir ou tiver títulos associados
   */
  async deletePublisher(id) {
    // Validar ID
    const publisherId = parseInt(id, 10);
    if (isNaN(publisherId) || publisherId <= 0) {
      throw new AppError('ID inválido', 400, 'INVALID_ID');
    }

    // Verificar se editora existe
    const publisher = await PublisherRepository.findById(publisherId);
    if (!publisher) {
      throw new AppError('Editora não encontrada', 404, 'PUBLISHER_NOT_FOUND');
    }

    // Verificar se há títulos associados
    const titlesCount = await PublisherRepository.countTitles(publisherId);
    if (titlesCount > 0) {
      throw new AppError(
        `Não é possível deletar esta editora pois ela possui ${titlesCount} título(s) associado(s)`,
        409,
        'HAS_ASSOCIATED_TITLES'
      );
    }

    // Deletar editora
    await PublisherRepository.delete(publisherId);
  }

  /**
   * Obter estatísticas de uma editora
   * @param {number} id - ID da editora
   * @returns {Promise<Object>} Estatísticas da editora
   */
  async getPublisherStats(id) {
    const publisherId = parseInt(id, 10);
    if (isNaN(publisherId) || publisherId <= 0) {
      throw new AppError('ID inválido', 400, 'INVALID_ID');
    }

    const publisher = await PublisherRepository.findById(publisherId);
    if (!publisher) {
      throw new AppError('Editora não encontrada', 404, 'PUBLISHER_NOT_FOUND');
    }

    const titlesCount = await PublisherRepository.countTitles(publisherId);

    return {
      publisher_id: publisherId,
      name: publisher.name,
      total_titles: titlesCount
    };
  }
}

module.exports = new PublisherService();
