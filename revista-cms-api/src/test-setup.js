// Test setup file - runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'revista_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_chars_required_for_testing';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

// Increase test timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  // Generate valid JWT token for testing
  generateValidToken: (payload = { id: 1, email: 'test@test.com', role: 'reader' }) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  },

  // Generate expired JWT token for testing
  generateExpiredToken: (payload = { id: 1, email: 'test@test.com', role: 'reader' }) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1h' });
  },

  // Sleep utility for async tests
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_TEST_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}
