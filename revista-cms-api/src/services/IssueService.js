const IssueRepository = require('../repositories/IssueRepository');
const IssueDTO = require('../dtos/IssueDTO');
const PaginationHelper = require('../utils/pagination');

/**
 * Service de Issues (Edições)
 * Responsabilidade: Lógica de negócio de edições
 */
class IssueService {
  /**
   * Listar todas as issues com filtros e paginação
   */
  async getAllIssues(filters = {}, paginationParams = {}) {
    const pagination = PaginationHelper.validateParams(
      paginationParams.page,
      paginationParams.limit
    );

    const { issues, total } = await IssueRepository.findAll(filters, pagination);

    return PaginationHelper.createResponse(
      IssueDTO.toListArray(issues),
      pagination.page,
      pagination.limit,
      total
    );
  }

  /**
   * Buscar issue por ID
   */
  async getIssueById(issueId) {
    // Validar ID
    const id = parseInt(issueId);
    if (isNaN(id) || id < 1) {
      const error = new Error('ID inválido');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    const issue = await IssueRepository.findById(id);

    if (!issue) {
      const error = new Error('Edição não encontrada');
      error.statusCode = 404;
      error.code = 'ISSUE_NOT_FOUND';
      throw error;
    }

    // Buscar issues similares
    const similarIssues = await IssueRepository.findSimilar(id);

    return {
      issue: IssueDTO.toFull(issue),
      similarIssues: IssueDTO.toMinimalList(similarIssues)
    };
  }

  /**
   * Criar nova issue
   */
  async createIssue(issueData) {
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

    // Verificar se já existe issue com mesmo title_id e issue_number
    const isDuplicate = await IssueRepository.isDuplicate(titleId, issueNumber);
    if (isDuplicate) {
      const error = new Error('Esta edição já existe para este título');
      error.statusCode = 409;
      error.code = 'DUPLICATE_ISSUE';
      throw error;
    }

    // Criar issue
    const issue = await IssueRepository.create({
      titleId,
      issueNumber,
      publicationYear,
      description,
      coverImageUrl,
      pdfFileUrl,
      pageCount,
      author,
      artist
    });

    // Buscar issue completa com dados relacionados
    const fullIssue = await IssueRepository.findById(issue.id);

    return IssueDTO.toFull(fullIssue);
  }

  /**
   * Atualizar issue
   */
  async updateIssue(issueId, issueData) {
    // Validar ID
    const id = parseInt(issueId);
    if (isNaN(id) || id < 1) {
      const error = new Error('ID inválido');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    // Verificar se issue existe
    const exists = await IssueRepository.exists(id);
    if (!exists) {
      const error = new Error('Edição não encontrada');
      error.statusCode = 404;
      error.code = 'ISSUE_NOT_FOUND';
      throw error;
    }

    // Verificar duplicata se estiver alterando titleId ou issueNumber
    if (issueData.titleId || issueData.issueNumber) {
      const currentIssue = await IssueRepository.findById(id);
      const titleId = issueData.titleId || currentIssue.title_id;
      const issueNumber = issueData.issueNumber || currentIssue.issue_number;

      const isDuplicate = await IssueRepository.isDuplicate(titleId, issueNumber, id);
      if (isDuplicate) {
        const error = new Error('Já existe outra edição com este número para este título');
        error.statusCode = 409;
        error.code = 'DUPLICATE_ISSUE';
        throw error;
      }
    }

    // Atualizar issue
    await IssueRepository.update(id, issueData);

    // Buscar issue atualizada com dados relacionados
    const updatedIssue = await IssueRepository.findById(id);

    return IssueDTO.toFull(updatedIssue);
  }

  /**
   * Deletar issue
   */
  async deleteIssue(issueId) {
    // Validar ID
    const id = parseInt(issueId);
    if (isNaN(id) || id < 1) {
      const error = new Error('ID inválido');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    const deleted = await IssueRepository.delete(id);

    if (!deleted) {
      const error = new Error('Edição não encontrada');
      error.statusCode = 404;
      error.code = 'ISSUE_NOT_FOUND';
      throw error;
    }

    return { message: 'Edição deletada com sucesso' };
  }

  /**
   * Buscar issues
   */
  async searchIssues(searchTerm, limit = 20) {
    if (!searchTerm || searchTerm.trim() === '') {
      const error = new Error('Termo de busca é obrigatório');
      error.statusCode = 400;
      error.code = 'SEARCH_TERM_REQUIRED';
      throw error;
    }

    // Validar e limitar o limit
    const validatedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    const issues = await IssueRepository.search(searchTerm.trim(), validatedLimit);

    return IssueDTO.toListArray(issues);
  }

  /**
   * Obter estatísticas de issues
   */
  async getIssueStats(titleId) {
    const count = await IssueRepository.countByTitle(titleId);

    return {
      totalIssues: count,
      titleId
    };
  }
}

module.exports = new IssueService();
