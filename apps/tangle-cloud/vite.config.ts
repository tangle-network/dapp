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
    exclude: ['node_modules/.vite/apps/tangle-cloud/deps']
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
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
