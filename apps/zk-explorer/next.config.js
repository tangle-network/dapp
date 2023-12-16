//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const nextConfigBase = require('../../next.config.js');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  ...nextConfigBase,

  // By default, this environment variable is only accessible by the server-side,
  // resulting in hydration mismatch. This makes the environment variable
  // accessible to both the server and client.
  env: {
    ZK_EXPLORER_GITHUB_CLIENT_ID:
      process.env.ZK_EXPLORER_GITHUB_CLIENT_ID ?? '',
  },

  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },

  // In order to load GitHub avatars for projects' owners,
  // GitHub must be registered as a host.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
