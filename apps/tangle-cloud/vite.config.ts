/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react-swc';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/tangle-cloud',
  server: {
    port: 4300,
    host: 'localhost',
    fs: {
      allow: ['../..'],
    },
  },
  define: {
    'process.env': {},
  },
  preview: {
    port: 4400,
    host: 'localhost',
  },
  plugins: [
    nodePolyfills({
      include: ['buffer', 'crypto', 'util', 'stream'],
    }),
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    svgr({ svgrOptions: { exportType: 'default' }, include: '**/*.svg' }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/tangle-cloud',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/')) {
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/')
            ) {
              return 'vendor-react';
            }

            if (id.includes('/wagmi/') || id.includes('/ox/')) {
              return 'vendor-wallet-wagmi';
            }

            if (id.includes('/viem/')) {
              return 'vendor-wallet-viem';
            }

            if (
              id.includes('/@walletconnect/') ||
              id.includes('/@web3modal/') ||
              id.includes('/@reown/')
            ) {
              return 'vendor-wallet-connect';
            }

            if (
              id.includes('/connectkit/') ||
              id.includes('/@coinbase-wallet/') ||
              id.includes('/cbw-sdk/') ||
              id.includes('/@metamask/') ||
              id.includes('/porto/')
            ) {
              return 'vendor-wallet-alt';
            }

            if (id.includes('/@polkadot/')) {
              return 'vendor-chain-polkadot';
            }

            if (id.includes('/asn1.js/') || id.includes('/bn.js/')) {
              return 'vendor-chain-crypto';
            }

            if (
              id.includes('/zod/') ||
              id.includes('/@hookform/') ||
              id.includes('/react-hook-form/')
            ) {
              return 'vendor-forms';
            }

            if (
              id.includes('/@tanstack/') ||
              id.includes('/zustand/') ||
              id.includes('/lodash/') ||
              id.includes('/date-fns/')
            ) {
              return 'vendor-state-data';
            }

            if (
              id.includes('/@radix-ui/') ||
              id.includes('/framer-motion/') ||
              id.includes('/recharts/')
            ) {
              return 'vendor-ui-runtime';
            }

            if (id.includes('/ethers/') || id.includes('/store/')) {
              return 'vendor-interop';
            }

            return 'vendor-misc';
          }

          if (id.includes('/libs/tangle-shared-ui/')) {
            return 'lib-tangle-shared-ui';
          }

          if (id.includes('/libs/ui-components/')) {
            return 'lib-ui-components';
          }

          if (id.includes('/libs/icons/')) {
            if (id.includes('/libs/icons/src/chains/')) {
              return /\/chains\/[a-m]/i.test(id)
                ? 'lib-icons-chains-a-m'
                : 'lib-icons-chains-n-z';
            }

            if (id.includes('/libs/icons/src/tokens/')) {
              return 'lib-icons-tokens';
            }

            if (id.includes('/libs/icons/src/wallets/')) {
              return 'lib-icons-wallets';
            }

            return 'lib-icons-core';
          }

          if (id.includes('/libs/dapp-config/')) {
            return 'lib-dapp-config';
          }

          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    /**
     * Always got error "The file does not exist
     * at "../tangle_network/dapp/node_modules/.vite/apps/tangle-cloud/deps/chunk-GNT2ENND.js?v=ed64ff7e" which is in the optimize deps directory.
     * The dependency might be incompatible with the dep optimizer. Try adding it to `optimizeDeps.exclude`."
     */
    exclude: ['node_modules/.vite/apps/tangle-cloud/deps'],
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    passWithNoTests: false,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/tangle-cloud',
      provider: 'v8',
    },
    setupFiles: [
      resolve(__dirname, '../../libs/tangle-shared-ui/src/utils/setupTest.ts'),
    ],
  },
});
