const IssueService = require('../services/IssueService');
const ResponseDTO = require('../dtos/ResponseDTO');

/**
 * Controller de Issues (Edições)
 * Responsabilidade: Receber requisições HTTP, chamar services, retornar respostas
 */

/**
 * Listar todas as edições (com filtros opcionais e paginação)
 */
const getAllIssues = async (req, res, next) => {
  try {
    const { title_id, publication_year, page, limit } = req.query;

    const filters = {
      titleId: title_id,
      publicationYear: publication_year
    };

    const paginationParams = { page, limit };

    const result = await IssueService.getAllIssues(filters, paginationParams);

    const response = ResponseDTO.paginated(result.data, result.pagination);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Obter uma edição por ID (com avaliação média e títulos similares)
 */
const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await IssueService.getIssueById(id);

    const response = ResponseDTO.success(result);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Criar uma nova edição (admin/editor)
 */
const createIssue = async (req, res, next) => {
  try {
    const {
      title_id,
      issue_number,
      publication_year,
      description,
      cover_image_url,
      pdf_file_url,
      page_count,
      author,
      artist
    } = req.body;

    const issueData = {
      titleId: title_id,
      issueNumber: issue_number,
      publicationYear: publication_year,
      description,
      coverImageUrl: cover_image_url,
      pdfFileUrl: pdf_file_url,
      pageCount: page_count,
      author,
      artist
    };

    const issue = await IssueService.createIssue(issueData);

    const response = ResponseDTO.created(issue, 'Edição criada com sucesso');
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Atualizar uma edição (admin/editor)
 */
const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title_id,
      issue_number,
      publication_year,
      description,
      cover_image_url,
      pdf_file_url,
      page_count,
      author,
      artist
    } = req.body;

    const issueData = {};
    if (title_id !== undefined) issueData.titleId = title_id;
    if (issue_number !== undefined) issueData.issueNumber = issue_number;
    if (publication_year !== undefined) issueData.publicationYear = publication_year;
    if (description !== undefined) issueData.description = description;
    if (cover_image_url !== undefined) issueData.coverImageUrl = cover_image_url;
    if (pdf_file_url !== undefined) issueData.pdfFileUrl = pdf_file_url;
    if (page_count !== undefined) issueData.pageCount = page_count;
    if (author !== undefined) issueData.author = author;
    if (artist !== undefined) issueData.artist = artist;

    const issue = await IssueService.updateIssue(id, issueData);

    const response = ResponseDTO.updated(issue, 'Edição atualizada com sucesso');
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletar uma edição (admin)
 */
const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await IssueService.deleteIssue(id);

    const response = ResponseDTO.deleted(result.message);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Buscar edições (busca global)
 */
const searchIssues = async (req, res, next) => {
  try {
    const { q, limit } = req.query;

    const issues = await IssueService.searchIssues(q, limit);

    const response = ResponseDTO.list(issues);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  searchIssues
};
