/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react-swc';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/tangle-cloud',

  server: {
    port: 4201,
    host: 'localhost',
    fs: {
      allow: ['../..'],
    },
  },

  preview: {
    port: 4301,
    host: 'localhost',
  },

  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    nodePolyfills({
      include: ['buffer', 'crypto', 'util', 'stream'],
    }),
  ],

  resolve: {
    preserveSymlinks: true,
    alias: [
      {
        find: 'react',
        replacement: resolve(__dirname, '../../node_modules/react'),
      },
      {
        find: 'react-dom',
        replacement: resolve(__dirname, '../../node_modules/react-dom'),
      },
      {
        find: 'react-router-dom',
        replacement: resolve(__dirname, '../../node_modules/react-router-dom'),
      },
      {
        find: '@webb-tools/webb-ui-components',
        replacement: resolve(__dirname, '../../libs/webb-ui-components/src'),
      },
      {
        find: '@webb-tools/tangle-shared-ui',
        replacement: resolve(__dirname, '../../libs/tangle-shared-ui/src'),
      },
    ],
  },

  build: {
    outDir: '../../dist/apps/tangle-cloud',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  define: {
    'process.env': {},
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['react', 'react-dom', 'react-router-dom', 'react/jsx-runtime'],
  },

  assetsInclude: ['**/*.svg'],

  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/tangle-cloud',
      provider: 'v8',
    },
    setupFiles: [resolve(__dirname, 'src/utils/setupTest.ts')],
  },
});
