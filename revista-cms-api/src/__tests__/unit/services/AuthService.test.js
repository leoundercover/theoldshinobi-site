const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies BEFORE importing
jest.mock('../../../repositories/UserRepository', () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  emailExists: jest.fn(),
  countByRole: jest.fn()
}));

jest.mock('../../../dtos/UserDTO', () => ({
  toPublic: jest.fn(),
  toAuthResponse: jest.fn(),
  toMinimal: jest.fn()
}));

const AuthService = require('../../../services/AuthService');
const UserRepository = require('../../../repositories/UserRepository');
const UserDTO = require('../../../dtos/UserDTO');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    it('should successfully register a new user', async () => {
      // Arrange
      UserRepository.emailExists.mockResolvedValue(false);
      UserRepository.create.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader',
        created_at: new Date()
      });
      UserDTO.toPublic.mockReturnValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader'
      });

      // Act
      const result = await AuthService.register(validUserData);

      // Assert
      expect(UserRepository.emailExists).toHaveBeenCalledWith('test@example.com');
      expect(UserRepository.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: expect.any(String),
        role: 'reader'
      });
      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader'
      });
    });

    it('should hash password with correct salt rounds', async () => {
      // Arrange
      UserRepository.emailExists.mockResolvedValue(false);
      UserRepository.create.mockResolvedValue({ id: 1 });
      UserDTO.toPublic.mockReturnValue({ id: 1 });

      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

      // Act
      await AuthService.register(validUserData);

      // Assert
      expect(bcryptHashSpy).toHaveBeenCalledWith(
        'SecurePass123!',
        expect.any(Number)
      );
      const saltRounds = bcryptHashSpy.mock.calls[0][1];
      expect(saltRounds).toBeGreaterThanOrEqual(10);

      bcryptHashSpy.mockRestore();
    });

    it('should always set role as "reader" for security', async () => {
      // Arrange
      UserRepository.emailExists.mockResolvedValue(false);
      UserRepository.create.mockResolvedValue({ id: 1 });
      UserDTO.toPublic.mockReturnValue({ id: 1 });

      const userDataWithAdmin = {
        ...validUserData,
        role: 'admin' // Trying to register as admin
      };

      // Act
      await AuthService.register(userDataWithAdmin);

      // Assert
      expect(UserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'reader' })
      );
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      UserRepository.emailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(AuthService.register(validUserData))
        .rejects
        .toThrow('Email já cadastrado');

      // Verify error properties
      try {
        await AuthService.register(validUserData);
      } catch (error) {
        expect(error.statusCode).toBe(409);
        expect(error.code).toBe('EMAIL_EXISTS');
      }

      expect(UserRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      // Arrange
      UserRepository.emailExists.mockResolvedValue(false);
      UserRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(AuthService.register(validUserData))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password_hash: '$2a$12$hashedpassword',
      role: 'reader'
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      UserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      UserDTO.toAuthResponse.mockReturnValue({
        user: { id: 1, email: 'test@example.com' },
        token: 'jwt.token.here'
      });

      // Act
      const result = await AuthService.login(validCredentials);

      // Assert
      expect(UserRepository.findByEmailWithPassword).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('SecurePass123!', mockUser.password_hash);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });

    it('should generate valid JWT token on login', async () => {
      // Arrange
      UserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const jwtSignSpy = jest.spyOn(jwt, 'sign');

      // Act
      await AuthService.login(validCredentials);

      // Assert
      expect(jwtSignSpy).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: expect.any(String) }
      );

      jwtSignSpy.mockRestore();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      UserRepository.findByEmailWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.login(validCredentials))
        .rejects
        .toThrow('Credenciais inválidas');

      try {
        await AuthService.login(validCredentials);
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.code).toBe('INVALID_CREDENTIALS');
      }
    });

    it('should throw error if password is invalid', async () => {
      // Arrange
      UserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      // Act & Assert
      await expect(AuthService.login(validCredentials))
        .rejects
        .toThrow('Credenciais inválidas');

      try {
        await AuthService.login(validCredentials);
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.code).toBe('INVALID_CREDENTIALS');
      }
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return user data for valid user ID', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader'
      };
      UserRepository.findById.mockResolvedValue(mockUser);
      UserDTO.toPublic.mockReturnValue(mockUser);

      // Act
      const result = await AuthService.getAuthenticatedUser(1);

      // Assert
      expect(UserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      UserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.getAuthenticatedUser(999))
        .rejects
        .toThrow('Usuário não encontrado');

      try {
        await AuthService.getAuthenticatedUser(999);
      } catch (error) {
        expect(error.statusCode).toBe(404);
        expect(error.code).toBe('USER_NOT_FOUND');
      }
    });
  });

  describe('generateToken', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'reader'
    };

    it('should generate a valid JWT token', () => {
      // Act
      const token = AuthService.generateToken(mockUser);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toMatchObject({
        id: 1,
        email: 'test@example.com',
        role: 'reader'
      });
    });

    it('should include expiration in token', () => {
      // Act
      const token = AuthService.generateToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Assert
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyToken', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'reader'
    };

    it('should verify and decode a valid token', () => {
      // Arrange
      const token = AuthService.generateToken(mockUser);

      // Act
      const decoded = AuthService.verifyToken(token);

      // Assert
      expect(decoded).toMatchObject({
        id: 1,
        email: 'test@example.com',
        role: 'reader'
      });
    });

    it('should throw error for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.jwt.token';

      // Act & Assert
      expect(() => AuthService.verifyToken(invalidToken))
        .toThrow('Token inválido ou expirado');

      try {
        AuthService.verifyToken(invalidToken);
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.code).toBe('INVALID_TOKEN');
      }
    });

    it('should throw error for expired token', () => {
      // Arrange
      const expiredToken = jwt.sign(
        mockUser,
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      // Act & Assert
      expect(() => AuthService.verifyToken(expiredToken))
        .toThrow('Token inválido ou expirado');
    });
  });

  describe('updateProfile', () => {
    it('should update allowed fields', async () => {
      // Arrange
      const mockUpdatedUser = {
        id: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        role: 'reader'
      };
      UserRepository.update.mockResolvedValue(mockUpdatedUser);
      UserDTO.toPublic.mockReturnValue(mockUpdatedUser);

      // Act
      const result = await AuthService.updateProfile(1, { name: 'Updated Name' });

      // Assert
      expect(UserRepository.update).toHaveBeenCalledWith(1, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });

    it('should not allow updating role field', async () => {
      // Arrange
      const mockUser = { id: 1, name: 'Test User', role: 'reader' };
      UserRepository.update.mockResolvedValue(mockUser);
      UserDTO.toPublic.mockReturnValue(mockUser);

      // Act
      await expect(
        AuthService.updateProfile(1, { role: 'admin' })
      ).rejects.toThrow('Nenhum campo válido para atualização');

      // Assert
      expect(UserRepository.update).not.toHaveBeenCalled();
    });

    it('should not allow updating email field', async () => {
      // Arrange
      await expect(
        AuthService.updateProfile(1, { email: 'newemail@example.com' })
      ).rejects.toThrow('Nenhum campo válido para atualização');

      // Assert
      expect(UserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      UserRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(
        AuthService.updateProfile(999, { name: 'New Name' })
      ).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('changePassword', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'reader'
    };

    const mockUserWithPassword = {
      ...mockUser,
      password_hash: '$2a$12$hashedpassword'
    };

    it('should successfully change password with valid current password', async () => {
      // Arrange
      UserRepository.findById.mockResolvedValue(mockUser);
      UserRepository.findByEmailWithPassword.mockResolvedValue(mockUserWithPassword);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2a$12$newhashedpassword');
      UserRepository.update.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.changePassword(1, 'OldPass123!', 'NewPass456!');

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith('OldPass123!', mockUserWithPassword.password_hash);
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass456!', expect.any(Number));
      expect(UserRepository.update).toHaveBeenCalledWith(1, {
        password_hash: '$2a$12$newhashedpassword'
      });
      expect(result).toEqual({ message: 'Senha alterada com sucesso' });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      UserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        AuthService.changePassword(999, 'OldPass123!', 'NewPass456!')
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('should throw error if current password is incorrect', async () => {
      // Arrange
      UserRepository.findById.mockResolvedValue(mockUser);
      UserRepository.findByEmailWithPassword.mockResolvedValue(mockUserWithPassword);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      // Act & Assert
      await expect(
        AuthService.changePassword(1, 'WrongPass123!', 'NewPass456!')
      ).rejects.toThrow('Senha atual incorreta');

      try {
        await AuthService.changePassword(1, 'WrongPass123!', 'NewPass456!');
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.code).toBe('INVALID_PASSWORD');
      }

      expect(UserRepository.update).not.toHaveBeenCalled();
    });
  });
});
