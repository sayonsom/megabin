/**
 * Generates a random base62 string of given length
 * @param {number} length length of the ID
 * @returns {string} random alphanumeric string
 */
export function generateShortId(length = 6) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
