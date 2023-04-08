import clientConfig from '../config/client';
import { TwitterLoginBody, TwitterLoginResponse } from '../types';
import parseTokensResponse from './parseTokensResponse';

/**
 * Login with twitter and return the tokens response
 * @param code the code returned from twitter
 * @param abortSignal the abort signal
 * @returns the tokens response or throw an error
 */
const loginWithTwitter = async (
  code: string,
  abortSignal?: AbortSignal
): Promise<TwitterLoginResponse> | never => {
  const body: TwitterLoginBody = {
    clientId: clientConfig.twitterClientId,
    code,
    codeVerifier: 'challenge',
    grantType: 'authorization_code',
    redirectUri: clientConfig.appUrl,
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const resp = await fetch('/api/auth/signin/twitter', {
    body: JSON.stringify(body),
    headers,
    method: 'POST',
    signal: abortSignal,
  });

  if (!resp.ok) {
    let msg = '';

    try {
      const json = await resp.json();
      console.group('ERROR JSON');
      console.log(json);
      console.groupEnd();
      msg = json.message || resp.statusText;
    } catch (error) {
      msg = resp.statusText;
    }

    throw new Error(`Error logging in with twitter: [${resp.status}] ${msg}`);
  }

  return parseTokensResponse(await resp.json());
};

export default loginWithTwitter;
