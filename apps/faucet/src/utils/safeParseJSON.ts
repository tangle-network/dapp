import { LoggerService } from '@webb-tools/browser-utils';
import { err, ok, Result } from 'neverthrow';

import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';

const logger = LoggerService.get('safeParseJSON');

/**
 * The safer function for parsing json from the response
 * @param response - response from the fetch
 * @param context - optional context for the error
 * @returns {Promise<Result<any, FaucetError<FaucetErrorCode.JSON_PARSE_ERROR>>>} - parsed json
 */
const safeParseJSON = async (
  response: Response,
  context?: string
): Promise<Result<any, FaucetError<FaucetErrorCode.JSON_PARSE_ERROR>>> => {
  try {
    const json = await response.json();
    return ok(json);
  } catch (e) {
    logger.error(e);
    return err(
      FaucetError.from(FaucetErrorCode.JSON_PARSE_ERROR, {
        context: context || 'safeParseJSON()',
      })
    );
  }
};

export default safeParseJSON;
