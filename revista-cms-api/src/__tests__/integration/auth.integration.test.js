const request = require('supertest');
const express = require('express');

// Mock AuthService BEFORE importing routes
jest.mock('../../services/AuthService', () => ({
  register: jest.fn(),
  login: jest.fn(),
  getAuthenticatedUser: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn()
}));

const authRoutes = require('../../routes/authRoutes');
const AuthService = require('../../services/AuthService');
const errorHandler = require('../../middleware/errorHandler');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  return app;
};

describe('Auth Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    it('should register a new user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader'
      };
      AuthService.register.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader'
      });
      expect(AuthService.register).toHaveBeenCalledWith(validRegistrationData);
    });

    it('should return 400 for missing required fields', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User' }); // Missing email and password

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid email format', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'SecurePass123!'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('email');
    });

    it('should return 400 for weak password', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123' // Too short
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 409 if email already exists', async () => {
      // Arrange
      const error = new Error('Email já cadastrado');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      AuthService.register.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Email já cadastrado');
    });

    it('should sanitize user input', async () => {
      // Arrange
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'reader' };
      AuthService.register.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '  Test User  ', // With whitespace
          email: ' TEST@EXAMPLE.COM ', // Uppercase and whitespace
          password: 'SecurePass123!'
        });

      // Assert
      expect(response.status).toBe(201);
      expect(AuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringMatching(/^Test User$/),
          email: expect.stringMatching(/test@example\.com/)
        })
      );
    });

    it('should reject XSS attempts in name field', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '<script>alert("xss")</script>',
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    it('should login successfully with valid credentials', async () => {
      // Arrange
      const mockAuthResponse = {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'reader'
        },
        token: 'jwt.token.here'
      };
      AuthService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.token).toBe('jwt.token.here');
      expect(AuthService.login).toHaveBeenCalledWith(validLoginData);
    });

    it('should return 400 for missing email', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'SecurePass123!' });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      AuthService.login.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Credenciais inválidas');
    });

    it('should normalize email before login', async () => {
      // Arrange
      const mockAuthResponse = {
        user: { id: 1 },
        token: 'jwt.token.here'
      };
      AuthService.login.mockResolvedValue(mockAuthResponse);

      // Act
      await request(app)
        .post('/api/auth/login')
        .send({
          email: ' TEST@EXAMPLE.COM ',
          password: 'SecurePass123!'
        });

      // Assert
      expect(AuthService.login).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.stringMatching(/test@example\.com/)
        })
      );
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user data with valid token', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader'
      };
      AuthService.getAuthenticatedUser.mockResolvedValue(mockUser);

      const token = global.testUtils.generateValidToken({ id: 1 });

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatchObject(mockUser);
    });

    it('should return 401 without token', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me');

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 401 with expired token', async () => {
      // Arrange
      const expiredToken = global.testUtils.generateExpiredToken({ id: 1 });

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should accept token in different Authorization formats', async () => {
      // Arrange
      const mockUser = { id: 1, name: 'Test User' };
      AuthService.getAuthenticatedUser.mockResolvedValue(mockUser);

      const token = global.testUtils.generateValidToken({ id: 1 });

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login endpoint', async () => {
      // Arrange
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      AuthService.login.mockRejectedValue(error);

      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      // Act - Make multiple requests
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(requests);

      // Assert - At least one should be rate limited
      const rateLimitedResponse = responses.find(r => r.status === 429);
      expect(rateLimitedResponse).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      AuthService.register.mockRejectedValue(new Error('Unexpected database error'));

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should not expose sensitive error details in production', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      AuthService.register.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      // Assert
      expect(response.body).not.toHaveProperty('stack');

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Input Validation', () => {
    it('should reject empty request body', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      // Assert
      expect(response.status).toBe(400);
    });

    it('should validate email format strictly', async () => {
      // Act
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test..user@example.com',
        'test@example',
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email,
            password: 'SecurePass123!'
          });

        expect(response.status).toBe(400);
      }
    });

    it('should validate password strength', async () => {
      // Act
      const weakPasswords = [
        '123',           // Too short
        'password',      // No numbers/special chars
        '12345678',      // No letters
        'Password',      // No numbers/special chars
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password
          });

        expect(response.status).toBe(400);
      }
    });
  });
});
