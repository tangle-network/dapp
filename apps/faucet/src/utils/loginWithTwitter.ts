import { err, Result } from 'neverthrow';

import clientConfig from '../config/client';
import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';
import { TwitterLoginBody, TwitterLoginResponse } from '../types';
import parseTokensResponse from './parseTokensResponse';

type LoginReturnType = Result<
  TwitterLoginResponse,
  | FaucetError<FaucetErrorCode.INVALID_RESPONSE>
  | FaucetError<FaucetErrorCode.TWITTER_LOGIN_FAILED>
  | FaucetError<FaucetErrorCode.JSON_PARSE_ERROR>
>;

/**
 * Login with twitter and return the tokens response
 * @param code the code returned from twitter
 * @param abortSignal the abort signal
 * @returns the tokens response or throw an error
 */
const loginWithTwitter = async (
  code: string,
  abortSignal?: AbortSignal
): Promise<LoginReturnType | undefined> => {
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

  try {
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

      return err(
        FaucetError.from(FaucetErrorCode.TWITTER_LOGIN_FAILED, {
          message: msg,
          status: resp.status,
        })
      );
    }

    try {
      const json = await resp.json();
      return parseTokensResponse(json);
    } catch (error) {
      return err(
        FaucetError.from(FaucetErrorCode.JSON_PARSE_ERROR, {
          context: 'loginWithTwitter()',
        })
      );
    }
  } catch (error) {
    // Ignore abort error
  }
};

export default loginWithTwitter;
