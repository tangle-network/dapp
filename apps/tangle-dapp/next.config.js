//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const nextConfigBase = require('../../next.config.js');

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
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

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

    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
