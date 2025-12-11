import {
  TANGLE_MAINNET_NETWORK,
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
} from '@tangle-network/ui-components/constants/networks';

// Default network for Substrate-based Tangle dApp
export const DEFAULT_NETWORK = TANGLE_MAINNET_NETWORK;

// Default networks for EVM-only apps (tangle-cloud, tangle-dapp v2)
// Use Tangle Local (Anvil) for local development, Base Sepolia otherwise
export const DEFAULT_EVM_NETWORK =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ANVIL_LOCAL_NETWORK
    : BASE_SEPOLIA_NETWORK;
