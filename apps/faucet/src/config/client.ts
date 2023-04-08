// Load the env variables and fallback to defaults
// This file is used by the client (browser)

import sharedConfig from './shared';

// The URL to call to login with twitter
const twitterLoginUrl = `${sharedConfig.faucetBackendUrl}/login/twitter`;

const config = {
  ...sharedConfig,
  twitterLoginUrl,
};

export default config;
