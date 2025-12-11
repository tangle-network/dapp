import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { wagmiChains as chains } from './chains/evm';

// WalletConnect project ID - should be configured via env var in production
const WALLETCONNECT_PROJECT_ID =
  process.env.VITE_WALLETCONNECT_PROJECT_ID ??
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  '3e45c77c9b5d51c8dcf9db03f6c4f826'; // Tangle's WalletConnect project ID

// Create config using RainbowKit's getDefaultConfig
// This automatically sets up all popular wallets with EIP-6963 detection
const config = getDefaultConfig({
  appName: 'Tangle Network',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains,
  transports: chains.reduce(
    (acc, chain) => {
      acc[chain.id] = http();
      return acc;
    },
    {} as Record<number, ReturnType<typeof http>>,
  ),
  ssr: false,
});

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
