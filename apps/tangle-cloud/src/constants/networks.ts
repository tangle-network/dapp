import type { Hex } from 'viem';
import { getBrowserLocalServiceUrl } from '@tangle-network/tangle-shared-ui/utils/localPreview';

export enum NetworkId {
  ANVIL_LOCAL = 6,
  BASE_SEPOLIA = 8,
  TEMPO_MODERATO = 9,
}

export type Network = {
  id: NetworkId;
  evmChainId?: number;
  name: string;
  tokenSymbol: 'tTNT' | 'TNT';
  nodeType: 'standalone';
  wsRpcEndpoints: string[];
  httpRpcEndpoints?: string[];
  polkadotJsDashboardUrl: string;
  evmExplorerUrl?: string;
  createExplorerAccountUrl: (address: string) => string | null;
  createExplorerTxUrl: (isEvm: boolean, txHash: Hex) => string | null;
};

export const ANVIL_LOCAL_NETWORK: Network = {
  id: NetworkId.ANVIL_LOCAL,
  evmChainId: 31337,
  name: 'Tangle Local',
  tokenSymbol: 'tTNT',
  nodeType: 'standalone',
  wsRpcEndpoints: [],
  httpRpcEndpoints: [getBrowserLocalServiceUrl(8545)],
  polkadotJsDashboardUrl: '',
  createExplorerAccountUrl: () => null,
  createExplorerTxUrl: () => null,
};

export const BASE_SEPOLIA_NETWORK: Network = {
  id: NetworkId.BASE_SEPOLIA,
  evmChainId: 84532,
  name: 'Base Sepolia',
  tokenSymbol: 'tTNT',
  nodeType: 'standalone',
  wsRpcEndpoints: [],
  httpRpcEndpoints: ['https://sepolia.base.org'],
  polkadotJsDashboardUrl: '',
  evmExplorerUrl: 'https://sepolia.basescan.org',
  createExplorerAccountUrl: (address) =>
    /^0x[a-fA-F0-9]{40}$/.test(address)
      ? `https://sepolia.basescan.org/address/${address}`
      : null,
  createExplorerTxUrl: (isEvm, txHash) =>
    isEvm ? `https://sepolia.basescan.org/tx/${txHash}` : null,
};

// Tempo Moderato hosts the live tnt-core 0.19 deployment. Its native gas asset
// is a USD stablecoin (see the viem chain def), but `tokenSymbol` here is the
// staking-token label used by the network switcher, so it stays `tTNT` like the
// other testnets.
export const TEMPO_MODERATO_NETWORK: Network = {
  id: NetworkId.TEMPO_MODERATO,
  evmChainId: 42431,
  name: 'Tempo Moderato',
  tokenSymbol: 'tTNT',
  nodeType: 'standalone',
  wsRpcEndpoints: [],
  httpRpcEndpoints: ['https://rpc.moderato.tempo.xyz'],
  polkadotJsDashboardUrl: '',
  evmExplorerUrl: 'https://explore.tempo.xyz',
  createExplorerAccountUrl: (address) =>
    /^0x[a-fA-F0-9]{40}$/.test(address)
      ? `https://explore.tempo.xyz/address/${address}`
      : null,
  createExplorerTxUrl: (isEvm, txHash) =>
    isEvm ? `https://explore.tempo.xyz/tx/${txHash}` : null,
};

export const TANGLE_CLOUD_NETWORKS = [
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
  TEMPO_MODERATO_NETWORK,
];
