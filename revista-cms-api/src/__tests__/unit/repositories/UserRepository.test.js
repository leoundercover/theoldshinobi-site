// Mock the database pool BEFORE importing
jest.mock('../../../config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  totalCount: 10,
  idleCount: 8,
  waitingCount: 0
}));

const UserRepository = require('../../../repositories/UserRepository');
const pool = require('../../../config/database');

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.findById(1);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
        [1]
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Act
      const result = await UserRepository.findById(999);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should not return password_hash field', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'reader'
        }],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.findById(1);

      // Assert
      expect(result).not.toHaveProperty('password_hash');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'reader'
      };

      pool.query.mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.findByEmail('test@example.com');

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if email not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Act
      const result = await UserRepository.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    const newUserData = {
      name: 'New User',
      email: 'new@example.com',
      passwordHash: '$2a$12$hashedpassword',
      role: 'reader'
    };

    it('should create a new user', async () => {
      // Arrange
      const createdUser = {
        id: 1,
        name: 'New User',
        email: 'new@example.com',
        role: 'reader',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({
        rows: [createdUser],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.create(newUserData);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        ['New User', 'new@example.com', '$2a$12$hashedpassword', 'reader']
      );
      expect(result).toEqual(createdUser);
    });

    it('should return user without password_hash in response', async () => {
      // Arrange
      const createdUser = {
        id: 1,
        name: 'New User',
        email: 'new@example.com',
        role: 'reader',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({
        rows: [createdUser],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.create(newUserData);

      // Assert
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should use RETURNING clause', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [{ id: 1 }],
        rowCount: 1
      });

      // Act
      await UserRepository.create(newUserData);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('RETURNING'),
        expect.any(Array)
      );
    });
  });

  describe('update', () => {
    it('should update user with provided fields', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const updatedUser = {
        id: 1,
        name: 'Updated Name',
        email: 'test@example.com',
        role: 'reader',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({
        rows: [updatedUser],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.update(1, updateData);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining(['Updated Name', 1])
      );
      expect(result).toEqual(updatedUser);
    });

    it('should update multiple fields', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      pool.query.mockResolvedValue({
        rows: [{ id: 1, ...updateData }],
        rowCount: 1
      });

      // Act
      await UserRepository.update(1, updateData);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/name = \$1.*email = \$2/),
        expect.arrayContaining(['Updated Name', 'updated@example.com', 1])
      );
    });

    it('should always update updated_at timestamp', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };

      pool.query.mockResolvedValue({
        rows: [{ id: 1 }],
        rowCount: 1
      });

      // Act
      await UserRepository.update(1, updateData);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('updated_at = NOW()'),
        expect.any(Array)
      );
    });

    it('should return current user if no fields to update', async () => {
      // Arrange
      const mockUser = { id: 1, name: 'Test User' };

      // Mock findById
      pool.query.mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.update(1, {});

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should ignore undefined values', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        email: undefined
      };

      pool.query.mockResolvedValue({
        rows: [{ id: 1 }],
        rowCount: 1
      });

      // Act
      await UserRepository.update(1, updateData);

      // Assert
      const query = pool.query.mock.calls[0][0];
      expect(query).toContain('name = $1');
      // Check that email is not in the SET clause (it appears in RETURNING but not SET)
      expect(query).not.toMatch(/email\s*=/);
    });
  });

  describe('delete', () => {
    it('should delete user by ID', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [{ id: 1 }],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.delete(1);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [1]
      );
      expect(result).toEqual({ id: 1 });
    });

    it('should return undefined if user not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Act
      const result = await UserRepository.delete(999);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: mockUsers, rowCount: 2 })
        .mockResolvedValueOnce({ rows: [{ count: '10' }], rowCount: 1 });

      // Act
      const result = await UserRepository.findAll(1, 20);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $1 OFFSET $2'),
        [20, 0]
      );
      expect(result).toEqual({
        users: mockUsers,
        total: 10
      });
    });

    it('should calculate correct offset for pagination', async () => {
      // Arrange
      pool.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 });

      // Act
      await UserRepository.findAll(3, 20);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [20, 40] // page 3, limit 20 = offset 40
      );
    });

    it('should order users by created_at DESC', async () => {
      // Arrange
      pool.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 });

      // Act
      await UserRepository.findAll();

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
    });

    it('should use default pagination values', async () => {
      // Arrange
      pool.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 });

      // Act
      await UserRepository.findAll();

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [20, 0] // default page 1, limit 20
      );
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [{ exists: true }],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.emailExists('existing@example.com');

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
        ['existing@example.com']
      );
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [{ exists: false }],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.emailExists('nonexistent@example.com');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('countByRole', () => {
    it('should count users by role', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [{ count: '5' }],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.countByRole('reader');

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) FROM users WHERE role = $1',
        ['reader']
      );
      expect(result).toBe(5);
    });

    it('should return 0 for role with no users', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.countByRole('admin');

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should return user with password_hash', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password_hash: '$2a$12$hashedpassword',
        role: 'reader'
      };

      pool.query.mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      });

      // Act
      const result = await UserRepository.findByEmailWithPassword('test@example.com');

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
      expect(result).toHaveProperty('password_hash');
    });

    it('should return undefined if user not found', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Act
      const result = await UserRepository.findByEmailWithPassword('nonexistent@example.com');

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
