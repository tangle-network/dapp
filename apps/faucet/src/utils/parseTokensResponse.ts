import { err, ok, Result } from 'neverthrow';

import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';
import { TwitterLoginResponse } from '../types';

/**
 * Parse the tokens response from the server
 * @param json the json response from the server
 * @returns the tokens response or throw an error
 */
const parseTokensResponse = (
  json: any
): Result<
  TwitterLoginResponse,
  FaucetError<FaucetErrorCode.INVALID_RESPONSE>
> => {
  const { accessToken, expiresIn, refreshToken, twitterHandle } = json;

  if (!accessToken || !expiresIn || !refreshToken || !twitterHandle) {
    return err(
      FaucetError.from(FaucetErrorCode.INVALID_RESPONSE, {
        context: 'parseTokensResponse()',
      })
    );
  }

  return ok({
    accessToken,
    expiresIn,
    refreshToken,
    twitterHandle,
  });
};

export default parseTokensResponse;
