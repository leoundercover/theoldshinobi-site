const PaginationHelper = require('../../../utils/pagination');

describe('PaginationHelper', () => {
  describe('validateParams', () => {
    it('should return default values when no params provided', () => {
      // Act
      const result = PaginationHelper.validateParams();

      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 20,
        offset: 0
      });
    });

    it('should validate and parse valid page and limit', () => {
      // Act
      const result = PaginationHelper.validateParams(2, 50);

      // Assert
      expect(result).toEqual({
        page: 2,
        limit: 50,
        offset: 50
      });
    });

    it('should convert string params to numbers', () => {
      // Act
      const result = PaginationHelper.validateParams('3', '25');

      // Assert
      expect(result).toEqual({
        page: 3,
        limit: 25,
        offset: 50
      });
    });

    it('should set minimum page to 1', () => {
      // Act
      const result1 = PaginationHelper.validateParams(0, 20);
      const result2 = PaginationHelper.validateParams(-5, 20);

      // Assert
      expect(result1.page).toBe(1);
      expect(result2.page).toBe(1);
    });

    it('should set minimum limit to 1', () => {
      // Act
      const result1 = PaginationHelper.validateParams(1, 0);
      const result2 = PaginationHelper.validateParams(1, -10);

      // Assert
      // When limit is 0 or negative, it defaults to 20
      expect(result1.limit).toBeGreaterThanOrEqual(1);
      expect(result2.limit).toBeGreaterThanOrEqual(1);
    });

    it('should cap limit at 100', () => {
      // Act
      const result1 = PaginationHelper.validateParams(1, 200);
      const result2 = PaginationHelper.validateParams(1, 500);

      // Assert
      expect(result1.limit).toBe(100);
      expect(result2.limit).toBe(100);
    });

    it('should handle invalid string inputs', () => {
      // Act
      const result = PaginationHelper.validateParams('invalid', 'notanumber');

      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 20,
        offset: 0
      });
    });

    it('should calculate correct offset', () => {
      // Act & Assert
      expect(PaginationHelper.validateParams(1, 20).offset).toBe(0);
      expect(PaginationHelper.validateParams(2, 20).offset).toBe(20);
      expect(PaginationHelper.validateParams(3, 20).offset).toBe(40);
      expect(PaginationHelper.validateParams(1, 50).offset).toBe(0);
      expect(PaginationHelper.validateParams(2, 50).offset).toBe(50);
      expect(PaginationHelper.validateParams(5, 10).offset).toBe(40);
    });

    it('should handle null and undefined values', () => {
      // Act
      const result1 = PaginationHelper.validateParams(null, null);
      const result2 = PaginationHelper.validateParams(undefined, undefined);

      // Assert
      expect(result1).toEqual({ page: 1, limit: 20, offset: 0 });
      expect(result2).toEqual({ page: 1, limit: 20, offset: 0 });
    });
  });

  describe('calculateMeta', () => {
    it('should calculate pagination metadata correctly', () => {
      // Act
      const result = PaginationHelper.calculateMeta(1, 20, 100);

      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false,
        nextPage: 2,
        prevPage: null
      });
    });

    it('should calculate metadata for middle page', () => {
      // Act
      const result = PaginationHelper.calculateMeta(3, 20, 100);

      // Assert
      expect(result).toEqual({
        page: 3,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
        nextPage: 4,
        prevPage: 2
      });
    });

    it('should calculate metadata for last page', () => {
      // Act
      const result = PaginationHelper.calculateMeta(5, 20, 100);

      // Assert
      expect(result).toEqual({
        page: 5,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: false,
        hasPrevPage: true,
        nextPage: null,
        prevPage: 4
      });
    });

    it('should handle single page of results', () => {
      // Act
      const result = PaginationHelper.calculateMeta(1, 20, 10);

      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
      });
    });

    it('should handle empty results', () => {
      // Act
      const result = PaginationHelper.calculateMeta(1, 20, 0);

      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
      });
    });

    it('should calculate total pages correctly with remainder', () => {
      // Act
      const result1 = PaginationHelper.calculateMeta(1, 20, 95); // 4.75 pages
      const result2 = PaginationHelper.calculateMeta(1, 20, 101); // 5.05 pages

      // Assert
      expect(result1.totalPages).toBe(5); // ceil(4.75) = 5
      expect(result2.totalPages).toBe(6); // ceil(5.05) = 6
    });

    it('should correctly identify hasNextPage and hasPrevPage', () => {
      // Act
      const firstPage = PaginationHelper.calculateMeta(1, 20, 100);
      const middlePage = PaginationHelper.calculateMeta(3, 20, 100);
      const lastPage = PaginationHelper.calculateMeta(5, 20, 100);

      // Assert
      expect(firstPage.hasNextPage).toBe(true);
      expect(firstPage.hasPrevPage).toBe(false);

      expect(middlePage.hasNextPage).toBe(true);
      expect(middlePage.hasPrevPage).toBe(true);

      expect(lastPage.hasNextPage).toBe(false);
      expect(lastPage.hasPrevPage).toBe(true);
    });
  });

  describe('getSQLClause', () => {
    it('should generate correct SQL LIMIT OFFSET clause', () => {
      // Act
      const result = PaginationHelper.getSQLClause(1, 20);

      // Assert
      expect(result).toBe('LIMIT 20 OFFSET 0');
    });

    it('should generate SQL clause for different pages', () => {
      // Act & Assert
      expect(PaginationHelper.getSQLClause(1, 20)).toBe('LIMIT 20 OFFSET 0');
      expect(PaginationHelper.getSQLClause(2, 20)).toBe('LIMIT 20 OFFSET 20');
      expect(PaginationHelper.getSQLClause(3, 50)).toBe('LIMIT 50 OFFSET 100');
    });

    it('should validate params in SQL clause generation', () => {
      // Act
      const result = PaginationHelper.getSQLClause(-5, 200);

      // Assert
      expect(result).toBe('LIMIT 100 OFFSET 0'); // page: 1, limit: 100 (capped)
    });

    it('should handle string inputs', () => {
      // Act
      const result = PaginationHelper.getSQLClause('2', '30');

      // Assert
      expect(result).toBe('LIMIT 30 OFFSET 30');
    });
  });

  describe('fromQuery', () => {
    it('should extract and validate params from query object', () => {
      // Arrange
      const query = { page: '2', limit: '50' };

      // Act
      const result = PaginationHelper.fromQuery(query);

      // Assert
      expect(result).toEqual({
        page: 2,
        limit: 50,
        offset: 50
      });
    });

    it('should use defaults for missing query params', () => {
      // Arrange
      const query = {};

      // Act
      const result = PaginationHelper.fromQuery(query);

      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 20,
        offset: 0
      });
    });

    it('should handle invalid query params', () => {
      // Arrange
      const query = { page: 'invalid', limit: 'notanumber' };

      // Act
      const result = PaginationHelper.fromQuery(query);

      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 20,
        offset: 0
      });
    });
  });

  describe('createResponse', () => {
    it('should create complete paginated response', () => {
      // Arrange
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      // Act
      const result = PaginationHelper.createResponse(data, 1, 20, 100);

      // Assert
      expect(result).toEqual({
        data: data,
        pagination: {
          page: 1,
          limit: 20,
          total: 100,
          totalPages: 5,
          hasNextPage: true,
          hasPrevPage: false,
          nextPage: 2,
          prevPage: null
        }
      });
    });

    it('should include data array in response', () => {
      // Arrange
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];

      // Act
      const result = PaginationHelper.createResponse(data, 1, 10, 30);

      // Assert
      expect(result.data).toBe(data);
      expect(result.data).toHaveLength(3);
    });

    it('should work with empty data array', () => {
      // Act
      const result = PaginationHelper.createResponse([], 1, 20, 0);

      // Assert
      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large page numbers', () => {
      // Act
      const result = PaginationHelper.validateParams(1000000, 20);

      // Assert
      expect(result.page).toBe(1000000);
      expect(result.offset).toBe(19999980);
    });

    it('should handle decimal inputs', () => {
      // Act
      const result = PaginationHelper.validateParams(2.7, 15.9);

      // Assert
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
    });

    it('should handle very small total counts', () => {
      // Act
      const result = PaginationHelper.calculateMeta(1, 20, 1);

      // Assert
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });
  });
});
