// File contains all shared types used in the app

import { UserV2 } from 'twitter-api-v2';
import { TransactionReceipt } from 'viem';

import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';

/**
 * Supported wallet address types
 */
export type AddressType = 'ethereum' | 'substrate';

/**
 * The chain type
 */
export type ChainType = 'Evm' | 'Substrate';

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

/**
 * The chain data type
 */
export type FaucetChainDataType = {
  /**
   * The chain name (used for display and render the `ChainIcon`)
   */
  name: string;

  /**
   * The chain type (Evm or Substrate)
   */
  type: ChainType;

  /**
   * The chain id
   */
  chainId: number;

  /**
   * The token address record
   * (token symbol -> contract address)
   */
  tokenAddresses: Record<string, string>;
};

/**
 * The mint token body response type
 */
export type MintTokenBody = {
  /**
   * The wallet requested to mint the token
   */
  wallet: {
    type: AddressType;
    value: string;
  };

  /**
   * The typed chain id
   */
  typed_chain_id: {
    [type in ChainType]: number;
  };

  /**
   * The last claimed date
   */
  last_claimed_date: string;

  /**
   * The twitter user data
   */
  user: UserV2;

  /**
   * The transaction receipt
   */
  tx_result: {
    Evm?: TransactionReceipt;
    Substrate?: string;
  };
};

export type MintTokenErrorCodes =
  | FaucetErrorCode.INVALID_SELECTED_CHAIN
  | FaucetErrorCode.MINT_TOKENS_FAILED
  | FaucetErrorCode.JSON_PARSE_ERROR;

/**
 * The mint token result type
 * (can be a tx hash or an EvmMintTokenBody)
 */
export type MintTokenResult = MintTokenBody | FaucetError<MintTokenErrorCodes>;
