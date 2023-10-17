//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const nextConfigBase = require('../../next.config.js');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  ...nextConfigBase,

  // at default environment variable is only accessible by the server, resulting in hydration mismatch
  // make environment variable accessible by both the server and client
  env: {},

  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },

  experimental: {
    serverActions: true,
  },

  // webpack config for wasm support
  // following this approach: https://github.com/vercel/next.js/issues/29362#issuecomment-1149903338
  webpack: (config) => {
    // Hide Critical dependency warning from @graphql-mesh/* packages
    // https://github.com/i18next/next-i18next/issues/1545#issuecomment-1005990731
    // NOTE: This is a workaround as
    // @graphql-mesh/config is not compatible to React or any other environment that uses bundler or something else
    // Check this issue https://github.com/Urigo/graphql-mesh/issues/2256#issuecomment-852846813
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
