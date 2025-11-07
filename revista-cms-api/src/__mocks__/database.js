// Mock PostgreSQL pool for testing

const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  totalCount: 10,
  idleCount: 8,
  waitingCount: 0
};

// Helper to reset all mocks
mockPool.resetMocks = () => {
  mockPool.query.mockReset();
  mockPool.connect.mockReset();
  mockPool.end.mockReset();
};

// Helper to mock successful query
mockPool.mockQuery = (rows = [], rowCount = null) => {
  mockPool.query.mockResolvedValueOnce({
    rows,
    rowCount: rowCount !== null ? rowCount : rows.length,
    command: 'SELECT',
    fields: []
  });
};

// Helper to mock query error
mockPool.mockQueryError = (error = new Error('Database error')) => {
  mockPool.query.mockRejectedValueOnce(error);
};

// Helper to mock multiple queries in sequence
mockPool.mockQueries = (results) => {
  results.forEach(result => {
    if (result instanceof Error) {
      mockPool.mockQueryError(result);
    } else {
      mockPool.mockQuery(result.rows || result, result.rowCount);
    }
  });
};

module.exports = mockPool;
