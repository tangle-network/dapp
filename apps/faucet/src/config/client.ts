// Load the env variables and fallback to defaults
// This file is used by the client (browser)

import sharedConfig from './shared';

// The URL to call to login with twitter
const twitterLoginUrl = `${sharedConfig.faucetBackendUrl}/login/twitter`;

// Mints fund URL
const mintTokensUrl = `${sharedConfig.faucetBackendUrl}/faucet`;

const config = {
  ...sharedConfig,
  mintTokensUrl,
  twitterLoginUrl,
};

export default config;
