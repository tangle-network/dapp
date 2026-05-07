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
      // `crypto` deliberately omitted: pulling it in adds ~680KB of
      // crypto-browserify that no first-party code uses. WalletConnect /
      // wagmi / viem all use Web Crypto + @noble/* directly.
      include: ['buffer', 'util', 'stream'],
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
    // Modern target keeps generated code lean — no async/await downleveling,
    // no class-field polyfills. All major browsers from 2023 onward support
    // ES2022. Anvil-targeting wallets (MetaMask, Rabby, Frame, …) all live
    // in modern browsers, so this is safe.
    target: 'es2022',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Split the formerly-1.7MB monolithic index chunk into vendor groups
        // so the browser can parallel-fetch + cache them between deploys.
        // First-load TTI improves because each chunk parses on its own
        // micro-task instead of one giant blocking compile.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@tangle-network/sandbox-ui')) return 'tangle-ui';
          if (id.includes('@tangle-network/blueprint-ui')) return 'tangle-ui';
          if (id.includes('@tangle-network/brand')) return 'tangle-ui';
          if (id.includes('connectkit')) return 'wallet';
          if (id.includes('@walletconnect')) return 'wallet';
          if (id.includes('wagmi')) return 'wallet';
          if (id.includes('viem')) return 'viem';
          if (id.includes('@tanstack')) return 'tanstack';
          if (id.includes('react-router')) return 'router';
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'react';
          }
          if (id.includes('@radix-ui')) return 'radix';
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
