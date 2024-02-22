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
    TESTNET_LEADERBOARD_BACKEND_URL:
      process.env['TESTNET_LEADERBOARD_BACKEND_URL'] ?? '',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets-global.website-files.com',
      },
    ],
  },

  // Allow the leaderboard component to be embedded on the marketing
  // site (tangle.tools), which uses Webflow.
  headers: async () => {
    return [
      {
        source: '/embed',
        headers: [
          // Allows embedding on tangle.tools.
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://www.tangle.tools/',
          },
        ],
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
