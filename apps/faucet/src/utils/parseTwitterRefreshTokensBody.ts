import { TwitterRefreshTokensBody } from '../types';

/**
 * Parses and validates the body of a Twitter refresh tokens request
 * @param body the body of the request
 */
const parseTwitterRefreshTokensBody = (body: any): TwitterRefreshTokensBody => {
  const { clientId, refreshToken } = body;
  if (!clientId || !refreshToken) {
    throw new Error('Missing required fields');
  }

  return {
    clientId,
    refreshToken,
  };
};

export default parseTwitterRefreshTokensBody;
