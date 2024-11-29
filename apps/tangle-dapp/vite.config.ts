import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
    }),
    visualizer({
      open: true,
      gzipSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@webb-tools/webb-ui-components'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@webb-tools/protocol-substrate-types'],
  },
  server: {
    port: 4200,
    open: true,
    host: true,
    fs: {
      allow: ['..'],
    },
    historyApiFallback: true,
  },
});
