/**
 * Fetches the prices of multiple tokens, return `Number.NaN`
 * if failed to fetch the price of that token.
 *
 * @param {string[]} tokens - An array of token symbols.
 * @returns {Promise<number[]>} A promise that resolves to an array of token prices.
 *
 * @example
 * const tokens = ['ETH', 'BTC', 'USDT'];
 * fetchTokenPrices(tokens).then(prices => {
 *   console.log(prices); // [2000, 30000, 1]
 * });
 *
 * @remarks
 * This function currently returns an array of `Number.NaN` and logs a warning to the console.
 * The actual implementation to fetch real token prices needs to be added.
 */
export const fetchTokenPrices = async (tokens: string[]): Promise<number[]> => {
  // TODO: Implement the proper logic to fetch the price of the tokens
  console.warn('fetchTokenPrices not implemented');
  return tokens.map(() => Number.NaN);
};

/**
 * Fetches the price of a single token, returns `Number.NaN` if failed to fetch the price.
 *
 * @param {string} _token - The symbol of the token.
 * @returns {Promise<number>} A promise that resolves to the token price.
 *
 * @example
 * const token = 'ETH';
 * fetchSingleTokenPrice(token).then(price => {
 *   console.log(price); // 2000
 * });
 *
 * @remarks
 * This function currently returns `Number.NaN` and logs a warning to the console.
 * The actual implementation to fetch the real token price needs to be added.
 * The function will return `Number.NaN` when failed to fetch the price.
 */
export const fetchSingleTokenPrice = async (
  _token: string,
): Promise<number> => {
  // TODO: Implement the proper logic to fetch the price of the token
  console.warn('fetchSingleTokenPrice not implemented');
  return Number.NaN;
};
