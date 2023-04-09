import { err, ok, Result } from 'neverthrow';

import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';
import { TwitterRefreshTokensBody } from '../types';

const requiredFields = ['clientId', 'refreshToken'] as const;

/**
 * Parses and validates the body of a Twitter refresh tokens request
 * @param body the body of the request
 */
const parseTwitterRefreshTokensBody = (
  body: any
): Result<
  TwitterRefreshTokensBody,
  FaucetError<FaucetErrorCode.INVALID_REQUEST_BODY>
> => {
  const { clientId, refreshToken } = body;
  if (!clientId || !refreshToken) {
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
    refreshToken,
  });
};

export default parseTwitterRefreshTokensBody;
