import { PresetTypedChainId, SolanaChainId } from '@tangle-network/dapp-types';
import { ChainConfig } from '../chain-config.interface';
import { ChainType } from '@tangle-network/dapp-types/TypedChainId';

export const chainsConfig = {
  [PresetTypedChainId.SolanaMainnet]: {
    chainType: ChainType.Solana,
    name: 'Solana',
    group: 'solana',
    tag: 'live',
    id: SolanaChainId.SolanaMainnet,
    nativeCurrency: {
      name: 'Solana Mainnet Token',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrls: {
      default: {
        http: ['https://api.mainnet-beta.solana.com'],
        webSocket: [],
      },
    },
    blockExplorers: {
      default: {
        name: 'Solana Explorer',
        url: 'https://explorer.solana.com',
      },
    },
  } satisfies ChainConfig,
} as const satisfies Record<number, ChainConfig>;
