const faucetBackendUrl =
  process.env.NEXT_PUBLIC_FAUCET_BACKEND_URL || 'http://127.0.0.1:8000';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4200';

const twitterClientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '';
if (!twitterClientId) {
  throw new Error(
    'NEXT_PUBLIC_TWITTER_CLIENT_ID is not set in the environment'
  );
}

const config = {
  appUrl,
  faucetBackendUrl,
  twitterClientId,
};

export default config;
