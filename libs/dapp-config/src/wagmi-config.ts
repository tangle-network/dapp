import { getDefaultConfig } from 'connectkit';
import { createConfig, http } from 'wagmi';
import { wagmiChains as chains } from './chains/evm';

// WalletConnect project ID - should be configured via env var in production
const WALLETCONNECT_PROJECT_ID =
  process.env.VITE_WALLETCONNECT_PROJECT_ID ??
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  '3e45c77c9b5d51c8dcf9db03f6c4f826'; // Tangle's WalletConnect project ID
const ENABLE_FAMILY_WALLET =
  process.env.VITE_ENABLE_FAMILY_WALLET === 'true' ||
  process.env.NEXT_PUBLIC_ENABLE_FAMILY_WALLET === 'true';

// Create config using ConnectKit's getDefaultConfig helper
// This automatically sets up all popular wallets with EIP-6963 detection
const config = createConfig(
  getDefaultConfig({
    appName: 'Tangle Network',
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    enableFamily: ENABLE_FAMILY_WALLET,
    chains,
    transports: chains.reduce(
      (acc, chain) => {
        const rpcUrl =
          chain.rpcUrls.default.http[0] ?? chain.rpcUrls.public?.http?.[0];
        acc[chain.id] = typeof rpcUrl === 'string' ? http(rpcUrl) : http();
        return acc;
      },
      {} as Record<number, ReturnType<typeof http>>,
    ),
  }),
);

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

export default function getWagmiConfig(_options?: { isSSR?: boolean }) {
  return config;
}

export { config };
