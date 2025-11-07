// Mock logger for testing

const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn(),
  database: jest.fn(),
  auth: jest.fn(),
  security: jest.fn()
};

// Helper to reset all mocks
mockLogger.resetMocks = () => {
  Object.keys(mockLogger).forEach(key => {
    if (typeof mockLogger[key] === 'function' && mockLogger[key].mockReset) {
      mockLogger[key].mockReset();
    }
  });
};

// Helper to check if specific log was called
mockLogger.hasErrorLogged = (message) => {
  return mockLogger.error.mock.calls.some(call =>
    call[0] && call[0].includes(message)
  );
};

mockLogger.hasInfoLogged = (message) => {
  return mockLogger.info.mock.calls.some(call =>
    call[0] && call[0].includes(message)
  );
};

module.exports = mockLogger;
