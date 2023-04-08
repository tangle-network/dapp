// Load the env variables and fallback to defaults
// This file is used by the server (node)

import sharedConfig from './shared';

const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET || '';
if (!twitterClientSecret) {
  throw new Error('TWITTER_CLIENT_SECRET is required');
}

const config = {
  ...sharedConfig,
  twitterClientSecret,
};

export default config;
