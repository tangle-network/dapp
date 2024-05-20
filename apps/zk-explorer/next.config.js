//@ts-check

// We still use CommonJS for Next.js apps as Nx plugins are not yet supported in ES modules
// Track the issues here:
// - https://github.com/nrwl/nx/issues/15682
// - https://github.com/nrwl/nx/issues/23048#issuecomment-2120106231

const { composePlugins, withNx } = require('@nx/next');
const nextConfigBase = require('../../next.config.cjs');

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
