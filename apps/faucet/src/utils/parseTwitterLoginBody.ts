import { TwitterLoginBody } from '../types';

/**
 * Parses and validates the body of a Twitter login request
 * @param body the body of the request
 * @returns the parsed body
 */
export default function parseTwitterLoginBody(body: any): TwitterLoginBody {
  const { clientId, code, codeVerifier, grantType, redirectUri } = body;
  if (!clientId || !code || !codeVerifier || !grantType || !redirectUri) {
    throw new Error('Missing required fields');
  }

  return {
    clientId,
    code,
    codeVerifier,
    grantType,
    redirectUri,
  };
}
