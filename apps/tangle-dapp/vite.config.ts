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
  cacheDir: '../../node_modules/.vite/apps/tangle-dapp',
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      // Nx can run Vite with a cwd different from `root`, so make this absolute.
      // Needed for dynamic imports that resolve to `/@fs/.../node_modules/.vite/...`.
      allow: [resolve(__dirname, '../..')],
    },
  },
  define: {
    'process.env': {},
    // Inline `global` → `globalThis` at compile time. Without this, the
    // `vite-plugin-node-polyfills` plugin (and various CJS-style modules
    // that reference `global`) emit a small runtime shim per chunk, which
    // Rollup then hoists into a shared chunk. That shared chunk previously
    // landed inside the `polkadot` vendor bundle, forcing the entire
    // polkadot chunk to be preloaded just to satisfy the `global`
    // reference in eager wallet/wagmi code paths.
    global: 'globalThis',
  },
  preview: {
    port: 4300,
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
    outDir: '../../dist/apps/tangle-dapp',
    emptyOutDir: true,
    reportCompressedSize: true,
    target: 'es2022',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Mirror tangle-cloud's vendor split — same payload shape,
        // same cache-stability characteristics across deploys.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@tangle-network/sandbox-ui')) return 'tangle-ui';
          if (id.includes('@tangle-network/blueprint-ui')) return 'tangle-ui';
          if (id.includes('@tangle-network/brand')) return 'tangle-ui';
          if (id.includes('connectkit')) return 'wallet';
          if (id.includes('@walletconnect')) return 'wallet';
          if (id.includes('wagmi')) return 'wallet';
          if (id.includes('viem')) return 'viem';
          if (id.includes('@polkadot')) return 'polkadot';
          // Pin `rxjs` and `observable-hooks` into their own chunk. They are
          // shared by both the eager EVM-side hook layer (via
          // `useActiveAccount`'s `BehaviorSubject`) and the substrate flows
          // (which transitively pull rxjs via `@polkadot/api`). Without this
          // rule, Rollup grouped rxjs into the polkadot chunk, which forced
          // the entire ~874KB polkadot vendor bundle into the eager
          // modulepreload waterfall just to satisfy the rxjs import.
          if (id.includes('node_modules/rxjs/')) return 'rxjs';
          if (id.includes('node_modules/observable-hooks/')) return 'rxjs';
          // `copy-to-clipboard` is a CommonJS module shared between the
          // eager `useCopyable` hook (used by `CopyWithTooltip`,
          // `TxHistoryDrawer`, etc.) and `@polkadot/react-identicon` (lazy).
          // When grouped together, the CJS interop helpers (`commonjsGlobal`,
          // `requireDist`, `getAugmentedNamespace`, …) live in the polkadot
          // chunk, which forces the entire polkadot vendor bundle to be
          // preloaded. Pinning it to its own chunk breaks that link.
          if (id.includes('node_modules/copy-to-clipboard/')) return 'utils';
          if (id.includes('node_modules/react-copy-to-clipboard/'))
            return 'utils';
          // `crypto-browserify` and its transitive CJS deps (bn.js,
          // elliptic, browserify-sign, create-ecdh, etc.) are pulled in by
          // `vite-plugin-node-polyfills` for any chunk that touches the
          // Node `crypto` global. Without this rule, the shared CJS interop
          // helpers leak into the polkadot vendor chunk, which then ends up
          // in the eager modulepreload waterfall on every cold load.
          // Pinning them to their own `crypto-polyfill` chunk lets Rollup
          // share the helpers there without touching polkadot.
          if (
            id.includes('node_modules/crypto-browserify/') ||
            id.includes('node_modules/browserify-sign/') ||
            id.includes('node_modules/browserify-rsa/') ||
            id.includes('node_modules/browserify-aes/') ||
            id.includes('node_modules/create-ecdh/') ||
            id.includes('node_modules/create-hash/') ||
            id.includes('node_modules/create-hmac/') ||
            id.includes('node_modules/elliptic/') ||
            id.includes('node_modules/bn.js/') ||
            id.includes('node_modules/asn1.js/') ||
            id.includes('node_modules/parse-asn1/') ||
            id.includes('node_modules/pbkdf2/') ||
            id.includes('node_modules/public-encrypt/') ||
            id.includes('node_modules/randomfill/') ||
            id.includes('node_modules/randombytes/') ||
            id.includes('node_modules/des.js/') ||
            id.includes('node_modules/diffie-hellman/') ||
            id.includes('node_modules/evp_bytestokey/') ||
            id.includes('node_modules/miller-rabin/') ||
            id.includes('node_modules/hash-base/') ||
            id.includes('node_modules/md5.js/') ||
            id.includes('node_modules/ripemd160/') ||
            id.includes('node_modules/sha.js/') ||
            id.includes('node_modules/cipher-base/') ||
            id.includes('node_modules/inherits/')
          ) {
            return 'crypto-polyfill';
          }
          // `@noble/hashes` and `@noble/curves` provide the modern crypto
          // primitives (keccak, sha256, secp256k1, ed25519). They're shared
          // by `viem`, `wagmi`/`@walletconnect` (eager), and `@polkadot/*`
          // (lazy). Without this rule, Rollup grouped them into the
          // polkadot chunk, which then forced polkadot to be preloaded for
          // every cold load just to satisfy the eager wallet/viem
          // dependency chain.
          if (id.includes('node_modules/@noble/')) return 'noble';
          // `eventemitter3` is used by `@polkadot/api` (lazy) AND by
          // `viem`/`@walletconnect` (eager). Same problem — grouping into
          // polkadot triggers eager preload.
          if (id.includes('node_modules/eventemitter3/')) return 'utils';
          // `globalthis` polyfill is shared between `vite-plugin-node-polyfills`
          // injected globals (eager, via wallet/wagmi crypto paths) and
          // `@polkadot/util` (lazy). Pinning it to the `utils` chunk keeps
          // it out of the polkadot vendor.
          if (id.includes('node_modules/globalthis/')) return 'utils';
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
    // These are dynamically imported (claims migration) and won't be picked up by static scanning.
    include: ['@polkadot/extension-dapp'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    dangerouslyIgnoreUnhandledErrors: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/tangle-dapp',
      provider: 'v8',
    },
    setupFiles: [
      resolve(__dirname, '../../libs/tangle-shared-ui/src/utils/setupTest.ts'),
    ],
  },
});
