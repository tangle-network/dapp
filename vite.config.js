import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: './dist/apps/monorepo',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  cacheDir: './node_modules/.vite/apps/my-app',
  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  resolve: {
    alias: {
      '@tangle-dapp': path.resolve(__dirname, './apps/tangle-dapp/src'),
      '@tangle-cloud': path.resolve(__dirname, './apps/tangle-cloud/src'),
    },
  },

  test: {
    reporters: ['default'],
    globals: true,
    cache: {
      dir: './node_modules/.vitest/apps/my-app',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
