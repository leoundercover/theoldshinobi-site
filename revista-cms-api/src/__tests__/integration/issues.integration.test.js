const request = require('supertest');
const express = require('express');

// Mock IssueService BEFORE importing routes
jest.mock('../../services/IssueService', () => ({
  getAllIssues: jest.fn(),
  getIssueById: jest.fn(),
  createIssue: jest.fn(),
  updateIssue: jest.fn(),
  deleteIssue: jest.fn(),
  searchIssues: jest.fn(),
  getIssueStats: jest.fn()
}));

// Mock AuthService for authentication
jest.mock('../../services/AuthService', () => ({
  verifyToken: jest.fn()
}));

const issueRoutes = require('../../routes/issueRoutes');
const IssueService = require('../../services/IssueService');
const AuthService = require('../../services/AuthService');
const errorHandler = require('../../middleware/errorHandler');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/issues', issueRoutes);
  app.use(errorHandler);
  return app;
};

describe('Issues Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /api/issues', () => {
    it('should return paginated list of issues', async () => {
      // Arrange
      const mockResponse = {
        data: [
          { id: 1, issue_number: 1, title_name: 'Test Comic' },
          { id: 2, issue_number: 2, title_name: 'Test Comic' }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
      IssueService.getAllIssues.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get('/api/issues');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should accept pagination parameters', async () => {
      // Arrange
      const mockResponse = {
        data: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 }
      };
      IssueService.getAllIssues.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get('/api/issues')
        .query({ page: 2, limit: 10 });

      // Assert
      expect(response.status).toBe(200);
      expect(IssueService.getAllIssues).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ page: '2', limit: '10' })
      );
    });

    it('should accept filter parameters', async () => {
      // Arrange
      const mockResponse = { data: [], pagination: {} };
      IssueService.getAllIssues.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get('/api/issues')
        .query({ title_id: 1, publication_year: 2024 });

      // Assert
      expect(response.status).toBe(200);
      expect(IssueService.getAllIssues).toHaveBeenCalledWith(
        expect.objectContaining({
          titleId: '1',
          publicationYear: '2024'
        }),
        expect.any(Object)
      );
    });

    it('should handle empty results', async () => {
      // Arrange
      const mockResponse = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      };
      IssueService.getAllIssues.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get('/api/issues');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/issues/search', () => {
    it('should search issues by term', async () => {
      // Arrange
      const mockResults = [
        { id: 1, issue_number: 1, title_name: 'Spider-Man' },
        { id: 2, issue_number: 2, title_name: 'Spider-Man' }
      ];
      IssueService.searchIssues.mockResolvedValue(mockResults);

      // Act
      const response = await request(app)
        .get('/api/issues/search')
        .query({ q: 'spider' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(IssueService.searchIssues).toHaveBeenCalledWith('spider', undefined);
    });

    it('should accept limit parameter', async () => {
      // Arrange
      IssueService.searchIssues.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get('/api/issues/search')
        .query({ q: 'test', limit: 10 });

      // Assert
      expect(response.status).toBe(200);
      expect(IssueService.searchIssues).toHaveBeenCalledWith('test', '10');
    });

    it('should return 400 if search term is missing', async () => {
      // Arrange
      const error = new Error('Termo de busca é obrigatório');
      error.statusCode = 400;
      error.code = 'SEARCH_TERM_REQUIRED';
      IssueService.searchIssues.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/issues/search');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return empty array for no matches', async () => {
      // Arrange
      IssueService.searchIssues.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get('/api/issues/search')
        .query({ q: 'nonexistent' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/issues/:id', () => {
    it('should return issue by ID with similar issues', async () => {
      // Arrange
      const mockResponse = {
        issue: {
          id: 1,
          issue_number: 1,
          title_name: 'Spider-Man',
          description: 'First issue',
          publication_year: 1963
        },
        similarIssues: [
          { id: 2, issue_number: 2, title_name: 'Spider-Man' }
        ]
      };
      IssueService.getIssueById.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get('/api/issues/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('issue');
      expect(response.body.data).toHaveProperty('similarIssues');
      expect(IssueService.getIssueById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if issue not found', async () => {
      // Arrange
      const error = new Error('Edição não encontrada');
      error.statusCode = 404;
      error.code = 'ISSUE_NOT_FOUND';
      IssueService.getIssueById.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/issues/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid ID format', async () => {
      // Arrange
      const error = new Error('ID inválido');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      IssueService.getIssueById.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/issues/invalid');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/issues', () => {
    const validIssueData = {
      title_id: 1,
      issue_number: 1,
      publication_year: 2024,
      description: 'Test issue description',
      cover_image_url: 'http://example.com/cover.jpg',
      pdf_file_url: 'http://example.com/issue.pdf',
      page_count: 24,
      author: 'Test Author',
      artist: 'Test Artist'
    };

    it('should create issue with admin token', async () => {
      // Arrange
      const mockCreatedIssue = { id: 1, ...validIssueData };
      IssueService.createIssue.mockResolvedValue(mockCreatedIssue);
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      });

      const token = global.testUtils.generateValidToken({ id: 1, role: 'admin' });

      // Act
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${token}`)
        .send(validIssueData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(IssueService.createIssue).toHaveBeenCalledWith({
        titleId: 1,
        issueNumber: 1,
        publicationYear: 2024,
        description: 'Test issue description',
        coverImageUrl: 'http://example.com/cover.jpg',
        pdfFileUrl: 'http://example.com/issue.pdf',
        pageCount: 24,
        author: 'Test Author',
        artist: 'Test Artist'
      });
    });

    it('should create issue with editor token', async () => {
      // Arrange
      const mockCreatedIssue = { id: 1, ...validIssueData };
      IssueService.createIssue.mockResolvedValue(mockCreatedIssue);
      AuthService.verifyToken.mockReturnValue({
        id: 2,
        email: 'editor@test.com',
        role: 'editor'
      });

      const token = global.testUtils.generateValidToken({ id: 2, role: 'editor' });

      // Act
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${token}`)
        .send(validIssueData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without authentication token', async () => {
      // Act
      const response = await request(app)
        .post('/api/issues')
        .send(validIssueData);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 403 with reader token', async () => {
      // Arrange
      AuthService.verifyToken.mockReturnValue({
        id: 3,
        email: 'reader@test.com',
        role: 'reader'
      });

      const token = global.testUtils.generateValidToken({ id: 3, role: 'reader' });

      // Act
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${token}`)
        .send(validIssueData);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should pass all fields to service even if some are missing', async () => {
      // Arrange
      const mockCreatedIssue = { id: 1 };
      IssueService.createIssue.mockResolvedValue(mockCreatedIssue);
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      });

      const token = global.testUtils.generateValidToken({ id: 1, role: 'admin' });

      // Act
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${token}`)
        .send({ title_id: 1, description: 'test' });

      // Assert
      expect(response.status).toBe(201);
      expect(IssueService.createIssue).toHaveBeenCalled();
    });

    it('should return 409 if duplicate issue exists', async () => {
      // Arrange
      const error = new Error('Esta edição já existe para este título');
      error.statusCode = 409;
      error.code = 'DUPLICATE_ISSUE';
      IssueService.createIssue.mockRejectedValue(error);
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      });

      const token = global.testUtils.generateValidToken({ id: 1, role: 'admin' });

      // Act
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${token}`)
        .send(validIssueData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/issues/:id', () => {
    const updateData = {
      description: 'Updated description',
      page_count: 32
    };

    it('should update issue with admin token', async () => {
      // Arrange
      const mockUpdatedIssue = { id: 1, ...updateData };
      IssueService.updateIssue.mockResolvedValue(mockUpdatedIssue);
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      });

      const token = global.testUtils.generateValidToken({ id: 1, role: 'admin' });

      // Act
      const response = await request(app)
        .put('/api/issues/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(IssueService.updateIssue).toHaveBeenCalledWith('1', {
        description: 'Updated description',
        pageCount: 32
      });
    });

    it('should update issue with editor token', async () => {
      // Arrange
      const mockUpdatedIssue = { id: 1, ...updateData };
      IssueService.updateIssue.mockResolvedValue(mockUpdatedIssue);
      AuthService.verifyToken.mockReturnValue({
        id: 2,
        email: 'editor@test.com',
        role: 'editor'
      });

      const token = global.testUtils.generateValidToken({ id: 2, role: 'editor' });

      // Act
      const response = await request(app)
        .put('/api/issues/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without authentication token', async () => {
      // Act
      const response = await request(app)
        .put('/api/issues/1')
        .send(updateData);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 403 with reader token', async () => {
      // Arrange
      AuthService.verifyToken.mockReturnValue({
        id: 3,
        email: 'reader@test.com',
        role: 'reader'
      });

      const token = global.testUtils.generateValidToken({ id: 3, role: 'reader' });

      // Act
      const response = await request(app)
        .put('/api/issues/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should return 404 if issue not found', async () => {
      // Arrange
      const error = new Error('Edição não encontrada');
      error.statusCode = 404;
      error.code = 'ISSUE_NOT_FOUND';
      IssueService.updateIssue.mockRejectedValue(error);
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      });

      const token = global.testUtils.generateValidToken({ id: 1, role: 'admin' });

      // Act
      const response = await request(app)
        .put('/api/issues/999')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/issues/:id', () => {
    it('should delete issue with admin token', async () => {
      // Arrange
      const mockResponse = { message: 'Edição deletada com sucesso' };
      IssueService.deleteIssue.mockResolvedValue(mockResponse);
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      });

      const token = global.testUtils.generateValidToken({ id: 1, role: 'admin' });

      // Act
      const response = await request(app)
        .delete('/api/issues/1')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(IssueService.deleteIssue).toHaveBeenCalledWith('1');
    });

    it('should return 401 without authentication token', async () => {
      // Act
      const response = await request(app)
        .delete('/api/issues/1');

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 403 with editor token', async () => {
      // Arrange
      AuthService.verifyToken.mockReturnValue({
        id: 2,
        email: 'editor@test.com',
        role: 'editor'
      });

      const token = global.testUtils.generateValidToken({ id: 2, role: 'editor' });

      // Act
      const response = await request(app)
        .delete('/api/issues/1')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should return 403 with reader token', async () => {
      // Arrange
      AuthService.verifyToken.mockReturnValue({
        id: 3,
        email: 'reader@test.com',
        role: 'reader'
      });

      const token = global.testUtils.generateValidToken({ id: 3, role: 'reader' });

      // Act
      const response = await request(app)
        .delete('/api/issues/1')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(403);
    });

    it('should return 404 if issue not found', async () => {
      // Arrange
      const error = new Error('Edição não encontrada');
      error.statusCode = 404;
      error.code = 'ISSUE_NOT_FOUND';
      IssueService.deleteIssue.mockRejectedValue(error);
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      });

      const token = global.testUtils.generateValidToken({ id: 1, role: 'admin' });

      // Act
      const response = await request(app)
        .delete('/api/issues/999')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Authorization Tests', () => {
    it('should enforce role-based access control', async () => {
      // Arrange
      const token = global.testUtils.generateValidToken({ id: 1, role: 'reader' });
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'reader@test.com',
        role: 'reader'
      });

      // Act & Assert
      // Reader cannot create
      const createResponse = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${token}`)
        .send({ titleId: 1, issueNumber: 1 });
      expect(createResponse.status).toBe(403);

      // Reader cannot update
      const updateResponse = await request(app)
        .put('/api/issues/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'test' });
      expect(updateResponse.status).toBe(403);

      // Reader cannot delete
      const deleteResponse = await request(app)
        .delete('/api/issues/1')
        .set('Authorization', `Bearer ${token}`);
      expect(deleteResponse.status).toBe(403);
    });

    it('should allow public access to read operations', async () => {
      // Arrange
      IssueService.getAllIssues.mockResolvedValue({ data: [], pagination: {} });
      IssueService.getIssueById.mockResolvedValue({
        issue: { id: 1 },
        similarIssues: []
      });
      IssueService.searchIssues.mockResolvedValue([]);

      // Act & Assert
      // Public can list
      const listResponse = await request(app).get('/api/issues');
      expect(listResponse.status).toBe(200);

      // Public can get by ID
      const getResponse = await request(app).get('/api/issues/1');
      expect(getResponse.status).toBe(200);

      // Public can search
      const searchResponse = await request(app).get('/api/issues/search').query({ q: 'test' });
      expect(searchResponse.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      IssueService.getAllIssues.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app)
        .get('/api/issues');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return proper error format', async () => {
      // Arrange
      const error = new Error('Custom error');
      error.statusCode = 422;
      error.code = 'CUSTOM_ERROR';
      IssueService.createIssue.mockRejectedValue(error);
      AuthService.verifyToken.mockReturnValue({
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      });

      const token = global.testUtils.generateValidToken({ id: 1, role: 'admin' });

      // Act
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${token}`)
        .send({ titleId: 1, issueNumber: 1 });

      // Assert
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
