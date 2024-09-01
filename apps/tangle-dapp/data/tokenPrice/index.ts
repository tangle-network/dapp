export const fetchTokenPrices = async (tokens: string[]): Promise<number[]> => {
  // TODO: Implement the proper logic to fetch the price of the tokens
  console.warn('fetchTokenPrices not implemented');
  return tokens.map(() => 0);
};

export const fetchSingleTokenPrice = async (
  _token: string,
): Promise<number> => {
  // TODO: Implement the proper logic to fetch the price of the token
  console.warn('fetchSingleTokenPrice not implemented');
  return 0;
};
