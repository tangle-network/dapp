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

  reactStrictMode: true,

  // at default environment variable is only accessible by the server, resulting in hydration mismatch
  // make environment variable accessible by both the server and client
  env: {
    BRIDGE_DAPP_WALLET_CONNECT_PROJECT_ID:
      process.env.BRIDGE_DAPP_WALLET_CONNECT_PROJECT_ID ?? '',
    TANGLE_DAPP_USE_LOCAL_RPC_ENDPOINT:
      process.env.TANGLE_DAPP_USE_LOCAL_RPC_ENDPOINT ?? '',
    OFAC_REGIONS: process.env.OFAC_REGIONS ?? '',
    OFAC_COUNTRY_CODES: process.env.OFAC_COUNTRY_CODES ?? '',
    USING_LOCAL_TANGLE: process.env.USING_LOCAL_TANGLE ?? '',
  },

  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },

  // Follow wasm example from next.js repo: https://github.com/vercel/next.js/blob/canary/examples/with-webassembly/next.config.js
  webpack(config, { isServer, dev }) {
    // Use the client static directory in the server bundle and prod mode
    // Fixes `Error occurred prerendering page "/"`
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? '../static/wasm/[modulehash].wasm'
        : 'static/wasm/[modulehash].wasm';

    // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // WalletConnect external modules: https://github.com/WalletConnect/walletconnect-monorepo/issues/1908#issuecomment-1487801131
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Hide warnings "Critical dependency: the request of a dependency is an expression"
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    // Handle SVG imports
    // @see https://react-svgr.com/docs/next/#usage
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find(
      (/** @type {{ test: { test: (arg0: string) => any; }; }} */ rule) =>
        rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
