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
  [FaucetErrorCode.INVALID_PARAMS]: {
    params: string[];
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

  // No payload for these errors
  [FaucetErrorCode.INVALID_RESPONSE]: undefined;
  [FaucetErrorCode.TWITTER_LOGIN_FAILED]: undefined;
  [FaucetErrorCode.REFRESH_TOKENS_FAILED]: undefined;
  [FaucetErrorCode.TWITTER_LOGIN_DENIED]: undefined;
};

export default ErrorPayload;
