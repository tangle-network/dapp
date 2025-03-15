/// <reference types='vitest' />
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import wasm from 'vite-plugin-wasm';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import svgr from 'vite-plugin-svgr';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/ui-components',

  plugins: [
    react(),
    nxViteTsPaths({ debug: false }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
    wasm(),
    svgr({ svgrOptions: { exportType: 'default' }, include: '**/*.svg' }),
  ],

  define: {
    'process.env': {},
  },

  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },

  optimizeDeps: {
    exclude: ['node_modules/.cache/storybook'],
  },

  // Uncomment this if you are using workers.
  // worker: {  //  plugins: [ nxViteTsPaths() ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../dist/libs/ui-components',
    emptyOutDir: true,
    reportCompressedSize: true,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'ui-components',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        exports: 'named',
        preserveModules: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          tailwindcss: 'tailwindcss',
        },
      },
    },
  },

  test: {
    globals: true,
    watch: false,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/ui-components',
      provider: 'v8',
    },
    passWithNoTests: true,
  },
});
