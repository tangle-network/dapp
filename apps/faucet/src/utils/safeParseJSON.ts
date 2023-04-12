import { err, ok, Result } from 'neverthrow';

import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';

/**
 * The safer function for parsing json from the response
 * @param response - response from the fetch
 * @returns {Promise<Result<any, FaucetError<FaucetErrorCode.JSON_PARSE_ERROR>>>} - parsed json
 */
const safeParseJSON = async <T = unknown>(
  response: Response
): Promise<Result<T, FaucetError<FaucetErrorCode.JSON_PARSE_ERROR>>> => {
  try {
    const json = await response.json();
    return ok(json);
  } catch (e) {
    return err(
      FaucetError.from(FaucetErrorCode.JSON_PARSE_ERROR, {
        context: JSON.stringify(e, null, 2),
      })
    );
  }
};

export default safeParseJSON;
