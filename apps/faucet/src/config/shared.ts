import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';

const faucetBackendUrl =
  process.env.NEXT_PUBLIC_FAUCET_BACKEND_URL || 'http://127.0.0.1:8000';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4200';

const twitterClientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '';
if (!twitterClientId) {
  throw FaucetError.from(FaucetErrorCode.MISSING_ENV_VAR, {
    envVar: 'NEXT_PUBLIC_TWITTER_CLIENT_ID',
  });
}

const config = {
  appUrl,
  faucetBackendUrl,
  twitterClientId,
};

export default config;
