import { TwitterLoginResponse } from '../types';

/**
 * Parse the tokens response from the server
 * @param json the json response from the server
 * @returns the tokens response or throw an error
 */
const parseTokensResponse = (json: any): TwitterLoginResponse | never => {
  const { accessToken, expiresIn, refreshToken, twitterHandle } = json;

  if (!accessToken || !expiresIn || !refreshToken || !twitterHandle) {
    throw new Error('Invalid tokens response');
  }

  return {
    accessToken,
    expiresIn,
    refreshToken,
    twitterHandle,
  };
};

export default parseTokensResponse;
