/**
 * Utilitário para conversão entre camelCase e snake_case
 */

/**
 * Converte string camelCase para snake_case
 * @param {string} str - String em camelCase
 * @returns {string} String em snake_case
 */
const toSnakeCase = (str) => {
  if (!str) return str;
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Converte string snake_case para camelCase
 * @param {string} str - String em snake_case
 * @returns {string} String em camelCase
 */
const toCamelCase = (str) => {
  if (!str) return str;
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Converte objeto de camelCase para snake_case
 * @param {Object} obj - Objeto com keys em camelCase
 * @returns {Object} Objeto com keys em snake_case
 */
const objectToSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const result = {};
  Object.keys(obj).forEach((key) => {
    result[toSnakeCase(key)] = obj[key];
  });
  return result;
};

/**
 * Converte objeto de snake_case para camelCase
 * @param {Object} obj - Objeto com keys em snake_case
 * @returns {Object} Objeto com keys em camelCase
 */
const objectToCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const result = {};
  Object.keys(obj).forEach((key) => {
    result[toCamelCase(key)] = obj[key];
  });
  return result;
};

module.exports = {
  toSnakeCase,
  toCamelCase,
  objectToSnakeCase,
  objectToCamelCase,
};
