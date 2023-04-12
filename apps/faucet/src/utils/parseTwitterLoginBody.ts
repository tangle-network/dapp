import { err, ok, Result } from 'neverthrow';

import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';
import { TwitterLoginBody } from '../types';

const requiredFields = [
  'clientId',
  'code',
  'codeVerifier',
  'grantType',
  'redirectUri',
] as const;

/**
 * Parses and validates the body of a Twitter login request
 * @param body the body of the request
 * @returns the parsed body
 */
export default function parseTwitterLoginBody(
  body: any
): Result<TwitterLoginBody, FaucetError<FaucetErrorCode.INVALID_REQUEST_BODY>> {
  const { clientId, code, codeVerifier, grantType, redirectUri } = body;

  if (!clientId || !code || !codeVerifier || !grantType || !redirectUri) {
    return err(
      FaucetError.from(FaucetErrorCode.INVALID_REQUEST_BODY, {
        extraInfo: `Missing fields: ${requiredFields
          .filter((field) => !body[field])
          .join(', ')}`,
      })
    );
  }

  return ok({
    clientId,
    code,
    codeVerifier,
    grantType,
    redirectUri,
  });
}
