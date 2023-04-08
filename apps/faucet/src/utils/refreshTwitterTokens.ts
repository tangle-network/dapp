import clientConfig from '../config/client';
import { TwitterRefreshTokensBody } from '../types';
import parseTokensResponse from './parseTokensResponse';

const refreshTwitterTokens = async (
  refreshToken: string,
  abortSignal?: AbortSignal
) => {
  const body: TwitterRefreshTokensBody = {
    clientId: clientConfig.twitterClientId,
    refreshToken,
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const resp = await fetch('/api/auth/refresh/twitter', {
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

    throw new Error(`Error refreshing twitter tokens: [${resp.status}] ${msg}`);
  }

  return parseTokensResponse(await resp.json());
};

export default refreshTwitterTokens;
