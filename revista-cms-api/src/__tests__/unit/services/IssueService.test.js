// Mock dependencies BEFORE importing
jest.mock('../../../repositories/IssueRepository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findSimilar: jest.fn(),
  isDuplicate: jest.fn(),
  create: jest.fn(),
  exists: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  countByTitle: jest.fn()
}));

jest.mock('../../../dtos/IssueDTO', () => ({
  toListArray: jest.fn(),
  toFull: jest.fn(),
  toMinimalList: jest.fn()
}));

jest.mock('../../../utils/pagination', () => ({
  validateParams: jest.fn(),
  createResponse: jest.fn()
}));

const IssueService = require('../../../services/IssueService');
const IssueRepository = require('../../../repositories/IssueRepository');
const IssueDTO = require('../../../dtos/IssueDTO');
const PaginationHelper = require('../../../utils/pagination');

describe('IssueService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllIssues', () => {
    it('should return paginated issues', async () => {
      // Arrange
      const mockIssues = [
        { id: 1, issue_number: 1, title: 'Issue 1' },
        { id: 2, issue_number: 2, title: 'Issue 2' }
      ];
      const mockPaginatedResponse = {
        data: mockIssues,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      };

      PaginationHelper.validateParams.mockReturnValue({ page: 1, limit: 20, offset: 0 });
      IssueRepository.findAll.mockResolvedValue({ issues: mockIssues, total: 2 });
      IssueDTO.toListArray.mockReturnValue(mockIssues);
      PaginationHelper.createResponse.mockReturnValue(mockPaginatedResponse);

      // Act
      const result = await IssueService.getAllIssues({}, { page: 1, limit: 20 });

      // Assert
      expect(PaginationHelper.validateParams).toHaveBeenCalledWith(1, 20);
      expect(IssueRepository.findAll).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 20, offset: 0 }
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should apply filters when provided', async () => {
      // Arrange
      const filters = { titleId: 1, publicationYear: 2020 };
      PaginationHelper.validateParams.mockReturnValue({ page: 1, limit: 20, offset: 0 });
      IssueRepository.findAll.mockResolvedValue({ issues: [], total: 0 });
      IssueDTO.toListArray.mockReturnValue([]);
      PaginationHelper.createResponse.mockReturnValue({ data: [], pagination: {} });

      // Act
      await IssueService.getAllIssues(filters);

      // Assert
      expect(IssueRepository.findAll).toHaveBeenCalledWith(
        filters,
        expect.any(Object)
      );
    });
  });

  describe('getIssueById', () => {
    const mockIssue = {
      id: 1,
      issue_number: 1,
      title: 'Issue 1',
      genre: 'Action'
    };

    const mockSimilarIssues = [
      { id: 2, issue_number: 2 },
      { id: 3, issue_number: 3 }
    ];

    it('should return issue with similar issues', async () => {
      // Arrange
      IssueRepository.findById.mockResolvedValue(mockIssue);
      IssueRepository.findSimilar.mockResolvedValue(mockSimilarIssues);
      IssueDTO.toFull.mockReturnValue({ ...mockIssue, full: true });
      IssueDTO.toMinimalList.mockReturnValue(mockSimilarIssues.map(i => ({ id: i.id })));

      // Act
      const result = await IssueService.getIssueById(1);

      // Assert
      expect(IssueRepository.findById).toHaveBeenCalledWith(1);
      expect(IssueRepository.findSimilar).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('issue');
      expect(result).toHaveProperty('similarIssues');
      expect(result.similarIssues).toHaveLength(2);
    });

    it('should throw error for invalid ID (NaN)', async () => {
      // Act & Assert
      await expect(IssueService.getIssueById('invalid'))
        .rejects
        .toThrow('ID inválido');

      try {
        await IssueService.getIssueById('invalid');
      } catch (error) {
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('INVALID_ID');
      }
    });

    it('should throw error for invalid ID (negative)', async () => {
      // Act & Assert
      await expect(IssueService.getIssueById(-1))
        .rejects
        .toThrow('ID inválido');
    });

    it('should throw error for invalid ID (zero)', async () => {
      // Act & Assert
      await expect(IssueService.getIssueById(0))
        .rejects
        .toThrow('ID inválido');
    });

    it('should throw error if issue not found', async () => {
      // Arrange
      IssueRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(IssueService.getIssueById(999))
        .rejects
        .toThrow('Edição não encontrada');

      try {
        await IssueService.getIssueById(999);
      } catch (error) {
        expect(error.statusCode).toBe(404);
        expect(error.code).toBe('ISSUE_NOT_FOUND');
      }
    });
  });

  describe('createIssue', () => {
    const validIssueData = {
      titleId: 1,
      issueNumber: 1,
      publicationYear: 2024,
      description: 'Test issue',
      coverImageUrl: 'cover.jpg',
      pdfFileUrl: 'issue.pdf',
      pageCount: 24,
      author: 'Test Author',
      artist: 'Test Artist'
    };

    it('should successfully create a new issue', async () => {
      // Arrange
      IssueRepository.isDuplicate.mockResolvedValue(false);
      IssueRepository.create.mockResolvedValue({ id: 1 });
      IssueRepository.findById.mockResolvedValue({ id: 1, ...validIssueData });
      IssueDTO.toFull.mockReturnValue({ id: 1, ...validIssueData });

      // Act
      const result = await IssueService.createIssue(validIssueData);

      // Assert
      expect(IssueRepository.isDuplicate).toHaveBeenCalledWith(1, 1);
      expect(IssueRepository.create).toHaveBeenCalledWith(validIssueData);
      expect(IssueRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
    });

    it('should throw error if duplicate issue exists', async () => {
      // Arrange
      IssueRepository.isDuplicate.mockResolvedValue(true);

      // Act & Assert
      await expect(IssueService.createIssue(validIssueData))
        .rejects
        .toThrow('Esta edição já existe para este título');

      try {
        await IssueService.createIssue(validIssueData);
      } catch (error) {
        expect(error.statusCode).toBe(409);
        expect(error.code).toBe('DUPLICATE_ISSUE');
      }

      expect(IssueRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateIssue', () => {
    const updateData = {
      description: 'Updated description',
      pageCount: 32
    };

    it('should successfully update an issue', async () => {
      // Arrange
      IssueRepository.exists.mockResolvedValue(true);
      IssueRepository.update.mockResolvedValue(true);
      IssueRepository.findById.mockResolvedValue({ id: 1, ...updateData });
      IssueDTO.toFull.mockReturnValue({ id: 1, ...updateData });

      // Act
      const result = await IssueService.updateIssue(1, updateData);

      // Assert
      expect(IssueRepository.exists).toHaveBeenCalledWith(1);
      expect(IssueRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toHaveProperty('id', 1);
    });

    it('should throw error for invalid ID', async () => {
      // Act & Assert
      await expect(IssueService.updateIssue('invalid', updateData))
        .rejects
        .toThrow('ID inválido');
    });

    it('should throw error if issue not found', async () => {
      // Arrange
      IssueRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await expect(IssueService.updateIssue(999, updateData))
        .rejects
        .toThrow('Edição não encontrada');

      expect(IssueRepository.update).not.toHaveBeenCalled();
    });

    it('should check for duplicates when updating titleId or issueNumber', async () => {
      // Arrange
      const updateWithNumbers = {
        titleId: 2,
        issueNumber: 5
      };
      const currentIssue = { id: 1, title_id: 1, issue_number: 1 };

      IssueRepository.exists.mockResolvedValue(true);
      IssueRepository.findById.mockResolvedValue(currentIssue);
      IssueRepository.isDuplicate.mockResolvedValue(false);
      IssueRepository.update.mockResolvedValue(true);
      IssueRepository.findById.mockResolvedValueOnce(currentIssue);
      IssueRepository.findById.mockResolvedValueOnce({ id: 1, ...updateWithNumbers });
      IssueDTO.toFull.mockReturnValue({ id: 1 });

      // Act
      await IssueService.updateIssue(1, updateWithNumbers);

      // Assert
      expect(IssueRepository.isDuplicate).toHaveBeenCalledWith(2, 5, 1);
    });

    it('should throw error if duplicate found when updating', async () => {
      // Arrange
      const updateWithNumbers = { titleId: 2, issueNumber: 5 };
      IssueRepository.exists.mockResolvedValue(true);
      IssueRepository.findById.mockResolvedValue({ id: 1, title_id: 1, issue_number: 1 });
      IssueRepository.isDuplicate.mockResolvedValue(true);

      // Act & Assert
      await expect(IssueService.updateIssue(1, updateWithNumbers))
        .rejects
        .toThrow('Já existe outra edição com este número para este título');

      expect(IssueRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteIssue', () => {
    it('should successfully delete an issue', async () => {
      // Arrange
      IssueRepository.delete.mockResolvedValue(true);

      // Act
      const result = await IssueService.deleteIssue(1);

      // Assert
      expect(IssueRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Edição deletada com sucesso' });
    });

    it('should throw error for invalid ID', async () => {
      // Act & Assert
      await expect(IssueService.deleteIssue('invalid'))
        .rejects
        .toThrow('ID inválido');
    });

    it('should throw error if issue not found', async () => {
      // Arrange
      IssueRepository.delete.mockResolvedValue(false);

      // Act & Assert
      await expect(IssueService.deleteIssue(999))
        .rejects
        .toThrow('Edição não encontrada');
    });
  });

  describe('searchIssues', () => {
    const mockSearchResults = [
      { id: 1, issue_number: 1, title: 'Test Issue 1' },
      { id: 2, issue_number: 2, title: 'Test Issue 2' }
    ];

    it('should search issues successfully', async () => {
      // Arrange
      IssueRepository.search.mockResolvedValue(mockSearchResults);
      IssueDTO.toListArray.mockReturnValue(mockSearchResults);

      // Act
      const result = await IssueService.searchIssues('test');

      // Assert
      expect(IssueRepository.search).toHaveBeenCalledWith('test', 20);
      expect(result).toEqual(mockSearchResults);
    });

    it('should trim search term', async () => {
      // Arrange
      IssueRepository.search.mockResolvedValue([]);
      IssueDTO.toListArray.mockReturnValue([]);

      // Act
      await IssueService.searchIssues('  test  ');

      // Assert
      expect(IssueRepository.search).toHaveBeenCalledWith('test', 20);
    });

    it('should throw error for empty search term', async () => {
      // Act & Assert
      await expect(IssueService.searchIssues(''))
        .rejects
        .toThrow('Termo de busca é obrigatório');

      await expect(IssueService.searchIssues('   '))
        .rejects
        .toThrow('Termo de busca é obrigatório');

      try {
        await IssueService.searchIssues('');
      } catch (error) {
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('SEARCH_TERM_REQUIRED');
      }
    });

    it('should validate and limit the limit parameter', async () => {
      // Arrange
      IssueRepository.search.mockResolvedValue([]);
      IssueDTO.toListArray.mockReturnValue([]);

      // Act - Test maximum limit
      await IssueService.searchIssues('test', 200);
      expect(IssueRepository.search).toHaveBeenCalledWith('test', 100);

      // Act - Test minimum limit
      await IssueService.searchIssues('test', -5);
      expect(IssueRepository.search).toHaveBeenCalledWith('test', 1);

      // Act - Test default limit
      await IssueService.searchIssues('test');
      expect(IssueRepository.search).toHaveBeenCalledWith('test', 20);
    });
  });

  describe('getIssueStats', () => {
    it('should return issue statistics for a title', async () => {
      // Arrange
      IssueRepository.countByTitle.mockResolvedValue(10);

      // Act
      const result = await IssueService.getIssueStats(1);

      // Assert
      expect(IssueRepository.countByTitle).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        totalIssues: 10,
        titleId: 1
      });
    });

    it('should return zero count for title with no issues', async () => {
      // Arrange
      IssueRepository.countByTitle.mockResolvedValue(0);

      // Act
      const result = await IssueService.getIssueStats(99);

      // Assert
      expect(result).toEqual({
        totalIssues: 0,
        titleId: 99
      });
    });
  });
});
