/**
 * Fetches the prices of multiple tokens, return `Error`
 * if failed to fetch the price of that token.
 *
 * @param {string[]} tokens - An array of token symbols.
 * @returns {Promise<(number | Error)[]>} A promise that resolves to an array of token prices.
 *
 * @example
 * const tokens = ['ETH', 'BTC', 'USDT'];
 * fetchTokenPrices(tokens).then(prices => {
 *   console.log(prices); // [2000, 30000, 1]
 * });
 *
 * @remarks
 * This function currently returns an array of `Error` and logs a warning to the console.
 * The actual implementation to fetch real token prices needs to be added.
 */
export const fetchTokenPrices = async (
  tokens: string[],
): Promise<(number | Error)[]> => {
  // TODO: Implement the proper logic to fetch the price of the tokens
  console.warn('fetchTokenPrices not implemented');
  return tokens.map(() => new Error('Token not found'));
};

/**
 * Fetches the price of a single token, returns `Error` if failed to fetch the price.
 *
 * @param {string} _token - The symbol of the token.
 * @returns {Promise<number | Error>} A promise that resolves to the token price.
 *
 * @example
 * const token = 'ETH';
 * fetchSingleTokenPrice(token).then(price => {
 *   console.log(price); // 2000
 * });
 *
 * @remarks
 * This function currently returns `Error` and logs a warning to the console.
 * The actual implementation to fetch the real token price needs to be added.
 * The function will return `Error` when failed to fetch the price.
 */
export const fetchSingleTokenPrice = async (
  _token: string,
): Promise<number | Error> => {
  // TODO: Implement the proper logic to fetch the price of the token
  console.warn('fetchSingleTokenPrice not implemented');
  return new Error('Token not found');
};
