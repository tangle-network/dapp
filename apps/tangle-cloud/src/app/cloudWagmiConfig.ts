import anvilLocal from '@tangle-network/dapp-config/chains/evm/customChains/anvilLocal';
import { getDefaultConfig } from 'connectkit';
import { baseSepolia } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { getBrowserLocalServiceUrl } from '@tangle-network/tangle-shared-ui/utils/localPreview';

/**
 * Tangle's WalletConnect project id — same one the staking dapp uses, so a
 * single operator hops between both products and sees their existing
 * wallet sessions instead of being re-prompted.
 */
const WALLETCONNECT_PROJECT_ID =
  (typeof process !== 'undefined' &&
    (process.env?.VITE_WALLETCONNECT_PROJECT_ID ??
      process.env?.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID)) ||
  '3e45c77c9b5d51c8dcf9db03f6c4f826';

const ENABLE_FAMILY_WALLET =
  (typeof process !== 'undefined' &&
    (process.env?.VITE_ENABLE_FAMILY_WALLET === 'true' ||
      process.env?.NEXT_PUBLIC_ENABLE_FAMILY_WALLET === 'true')) ||
  false;

const chains = [anvilLocal, baseSepolia] as const;

/**
 * Wallet config matches the Tangle staking dapp — ConnectKit's
 * `getDefaultConfig` auto-wires WalletConnect, Coinbase Wallet, Family
 * Wallet (when enabled), and EIP-6963 multi-injected discovery. Previously
 * this was a one-liner `connectors: [injected()]`, which is why the
 * connect modal showed a single "Injected" option and felt empty next to
 * the staking app's six-wallet picker.
 */
export const cloudWagmiConfig = createConfig(
  getDefaultConfig({
    appName: 'Tangle Cloud',
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    enableFamily: ENABLE_FAMILY_WALLET,
    chains,
    transports: {
      [anvilLocal.id]: http(getBrowserLocalServiceUrl(8545), {
        timeout: 4_000,
      }),
      [baseSepolia.id]: http('https://sepolia.base.org', { timeout: 8_000 }),
    },
  }),
);
