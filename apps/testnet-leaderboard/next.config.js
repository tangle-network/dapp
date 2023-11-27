//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },

  reactStrictMode: true,

  // at default environment variable is only accessible by the server, resulting in hydration mismatch
  // make environment variable accessible by both the server and client
  env: {
    TESTNET_LEADERBOARD_END_DATE:
      process.env['TESTNET_LEADERBOARD_END_DATE'] ?? '',
    TESTNET_LEADERBOARD_GUIDELINES_URL:
      process.env['TESTNET_LEADERBOARD_GUIDELINES_URL'] ?? '',
    TESTNET_LEADERBOARD_REQUEST_POINTS_URL:
      process.env['TESTNET_LEADERBOARD_REQUEST_POINTS_URL'] ?? '',
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
