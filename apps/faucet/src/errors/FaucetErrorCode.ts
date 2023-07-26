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
   * Invalid request body
   */
  INVALID_REQUEST_BODY,

  /**
   * Inavlid selected chain
   */
  INVALID_SELECTED_CHAIN,

  /**
   * Refresh tokens failed
   */
  REFRESH_TOKENS_FAILED,

  /**
   * The user denied the login request to Twitter
   */
  TWITTER_LOGIN_DENIED,

  /**
   * The error when call `.json()` on the response
   */
  JSON_PARSE_ERROR,

  /**
   * To many requests at the same time
   */
  TOO_MANY_CLAIM_REQUESTS,

  /**
   * Mint tokens failed
   */
  MINT_TOKENS_FAILED,

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
