// Load the env variables and fallback to defaults
// This file is used by the server (node)

import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';
import sharedConfig from './shared';

const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET || '';
if (!twitterClientSecret) {
  throw FaucetError.from(FaucetErrorCode.MISSING_ENV_VAR, {
    envVar: 'TWITTER_CLIENT_SECRET',
  });
}

const config = {
  ...sharedConfig,
  twitterClientSecret,
};

export default config;
