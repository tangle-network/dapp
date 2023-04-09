enum FaucetErrorCode {
  /**
   * The environment variable is missing
   */
  MISSING_ENV_VAR,

  /**
   * The provided key is not existent in the store
   */
  INVALID_STORE_KEY,

  /**
   * Twitter login failed
   */
  TWITTER_LOGIN_FAILED,

  /**
   * Invalid response from the next server
   */
  INVALID_RESPONSE,

  /**
   * Invalid parameters
   */
  INVALID_PARAMS,

  /**
   * Refresh tokens failed
   */
  REFRESH_TOKENS_FAILED,

  /**
   * The user denied the login request to Twitter
   */
  TWITTER_LOGIN_DENIED,

  /**
   * Unknown error
   */
  UNKNOWN,

  /**
   * Unknown twitter error
   */
  UNKNOWN_TWITTER_ERROR,
}

export default FaucetErrorCode;
