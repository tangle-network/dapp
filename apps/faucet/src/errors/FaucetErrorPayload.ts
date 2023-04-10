import FaucetErrorCode from './FaucetErrorCode';

type ErrorPayload = {
  /**
   * The environment variable is missing
   */
  [FaucetErrorCode.MISSING_ENV_VAR]: {
    envVar: string;
  };

  /**
   * The key which is not existent in the store
   */
  [FaucetErrorCode.INVALID_STORE_KEY]: {
    storeKey: string;
  };

  /**
   * The parameters which are invalid
   */
  [FaucetErrorCode.INVALID_REQUEST_BODY]: {
    extraInfo: string;
  };

  /**
   * Extra info for the twitter login failed error
   */
  [FaucetErrorCode.TWITTER_LOGIN_FAILED]: {
    status: number;
    message: string;
  };

  /**
   * Extra info for the refresh tokens failed error
   */
  [FaucetErrorCode.REFRESH_TOKENS_FAILED]: {
    status: number;
    message: string;
  };

  /**
   * Extra info for the unknown error
   */
  [FaucetErrorCode.UNKNOWN]: {
    extraInfo: string;
  };

  /**
   * Extra info for the unknown twitter error,
   * which can be parsed from the search params
   */
  [FaucetErrorCode.UNKNOWN_TWITTER_ERROR]: {
    error: string;
  };

  /**
   * Extra info for the JSON parse error
   */
  [FaucetErrorCode.JSON_PARSE_ERROR]: {
    context: string;
  };

  /**
   * Extra info for the invalid response error
   */
  [FaucetErrorCode.INVALID_RESPONSE]: {
    context: string;
  };

  /**
   * Extra info for the mint tokens failed error
   */
  [FaucetErrorCode.MINT_TOKENS_FAILED]:
    | {
        status?: number;
        extraInfo: string;
      }
    | undefined;

  /**
   * The selected chain is invalid
   */
  [FaucetErrorCode.INVALID_SELECTED_CHAIN]:
    | {
        selectedChain: string;
      }
    | undefined;

  // No payload for these errors
  [FaucetErrorCode.TWITTER_LOGIN_DENIED]: undefined;
};

export default ErrorPayload;
