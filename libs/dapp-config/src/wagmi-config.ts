import { createClient, fallback, http } from 'viem';
import { Config, cookieStorage, createConfig, createStorage } from 'wagmi';
import { injected, coinbaseWallet, safe, walletConnect } from 'wagmi/connectors';
import { wagmiChains as chains } from './chains/evm';

// WalletConnect project ID - should be configured via env var in production
const WALLETCONNECT_PROJECT_ID =
  process.env.VITE_WALLETCONNECT_PROJECT_ID ??
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  'demo-project-id';

let config: Config<typeof chains>;

/**
 * Registers the wagmi config
 *
 * @see {@link https://wagmi.sh/react/typescript#config-types}
 */
declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export type GetWagmiConfigParamsType = {
  isSSR?: boolean;
};

export default function getWagmiConfig({
  isSSR,
}: GetWagmiConfigParamsType = {}) {
  if (config === undefined) {
    config = createConfig({
      ...(typeof isSSR === 'boolean' ? { ssr: isSSR } : {}),
      ...(isSSR === true
        ? {
            storage: createStorage({
              storage: cookieStorage,
            }),
          }
        : {}),
      chains,
      // Enable EIP-6963 multi-injected provider discovery
      // This allows detection of MetaMask, Rainbow, etc. by their rdns
      multiInjectedProviderDiscovery: true,
      connectors: [
        // Injected wallets (MetaMask, Rainbow, etc.)
        injected(),
        // Coinbase Wallet
        coinbaseWallet({
          appName: 'Tangle Network',
        }),
        // Safe Wallet
        safe(),
        // WalletConnect
        walletConnect({
          projectId: WALLETCONNECT_PROJECT_ID,
          showQrModal: true,
        }),
      ],
      client: ({ chain }) => {
        return createClient({
          chain,
          transport: fallback(
            chain.rpcUrls.default.http.map((url) =>
              http(url, { timeout: 60_000 }),
            ),
          ),
        });
      },
    });
  }

  return config;
}
