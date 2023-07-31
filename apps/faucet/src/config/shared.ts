import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';

const faucetBackendUrl =
  process.env.NEXT_PUBLIC_FAUCET_BACKEND_URL || 'http://127.0.0.1:8000';

/**
 * The amount of tokens to send to the user. Defaults to 20.
 */
const amount = process.env.NEXT_PUBLIC_AMOUNT
  ? +process.env.NEXT_PUBLIC_AMOUNT
  : 20;

const nativeAmount = process.env.NEXT_PUBLIC_NATIVE_AMOUNT
  ? +process.env.NEXT_PUBLIC_NATIVE_AMOUNT
  : 0.5;

const twitterClientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '';
if (!twitterClientId) {
  throw FaucetError.from(FaucetErrorCode.MISSING_ENV_VAR, {
    envVar: 'NEXT_PUBLIC_TWITTER_CLIENT_ID',
  });
}

const config = {
  amount,
  faucetBackendUrl,
  nativeAmount,
  twitterClientId,
};

export default config;
