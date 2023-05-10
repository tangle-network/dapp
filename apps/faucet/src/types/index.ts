// File contains all shared types used in the app

/**
 * The twitter login response type
 */
export type TwitterLoginResponse = {
  /**
   * The twitter access token
   */
  accessToken: string;

  /**
   * The twitter access token expiration time in seconds
   * @example 3600
   */
  expiresIn: number;

  /**
   * The twitter refresh token used to refresh the access token
   */
  refreshToken: string;

  /**
   * The twitter handle of the user
   * @example 'webbprotocol'
   */
  twitterHandle: string;
};

/**
 * The twitter login body type
 */
export type TwitterLoginBody = {
  /**
   * The twitter client id
   */
  clientId: string;

  /**
   * The twitter code (extract from the search params when redirected from twitter)
   */
  code: string;

  /**
   * The twitter code verifier
   */
  codeVerifier: 'challenge';

  /**
   * The twitter grant type
   */
  grantType: 'authorization_code';

  /**
   * The twitter redirect uri
   */
  redirectUri: string;
};

/**
 * The twitter refresh tokens body type
 */
export type TwitterRefreshTokensBody = {
  /*
   * The twitter client id
   */
  clientId: string;

  /**
   * The refresh token used to refresh the access token
   */
  refreshToken: string;
};

/**
 * The token input type used in the addTokenToMetamask function
 */
export type TokenInput = {
  /**
   * The token address
   */
  address: string;

  /**
   * The token decimals
   */
  decimals: number;

  /**
   * The token image url
   */
  image: string;

  /**
   * The token symbol
   */
  symbol: string;
};
