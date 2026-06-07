// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

import { ChainType, PresetTypedChainId } from '@tangle-network/dapp-types';
import {
  mainnet,
  arbitrumGoerli,
  avalancheFuji,
  goerli,
  holesky,
  moonbaseAlpha,
  optimismGoerli,
  polygonMumbai,
  scrollSepolia,
  sepolia,
  polygon,
  arbitrum,
  optimism,
  linea,
  base,
  baseSepolia,
  bsc,
  bitlayer,
} from 'viem/chains';
import type { ChainConfig } from '../chain-config.interface';
import anvilLocal from './customChains/anvilLocal';

// Primary chains for development and production
export const wagmiChains = [
  anvilLocal, // Local development (Anvil on port 8545)
  base, // Base mainnet
  baseSepolia, // Base testnet
  mainnet, // Ethereum mainnet (for native staking)
  {
    ...holesky,
    // Override RPC URLs to prevent CORS issues
    rpcUrls: {
      default: {
        http: ['https://ethereum-holesky-rpc.publicnode.com'],
      },
      public: {
        http: ['https://ethereum-holesky-rpc.publicnode.com'],
      },
    },
  }, // Ethereum Holesky testnet (for native staking)
] as const;

export const chainsConfig = {
  [PresetTypedChainId.EthereumMainNet]: {
    ...mainnet,
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'live',
    displayName: 'Ethereum',
  } satisfies ChainConfig,

  [PresetTypedChainId.Polygon]: {
    ...polygon,
    chainType: ChainType.EVM,
    group: 'polygon',
    tag: 'live',
    displayName: 'Polygon',
  } satisfies ChainConfig,

  [PresetTypedChainId.Arbitrum]: {
    ...arbitrum,
    chainType: ChainType.EVM,
    group: 'arbitrum',
    tag: 'live',
    displayName: 'Arbitrum',
  } satisfies ChainConfig,

  [PresetTypedChainId.Optimism]: {
    ...optimism,
    chainType: ChainType.EVM,
    group: 'optimism',
    tag: 'live',
    displayName: 'Optimism',
  } satisfies ChainConfig,

  [PresetTypedChainId.Linea]: {
    ...linea,
    chainType: ChainType.EVM,
    group: 'linea',
    tag: 'live',
    displayName: 'Linea',
  } satisfies ChainConfig,

  [PresetTypedChainId.Base]: {
    ...base,
    chainType: ChainType.EVM,
    group: 'base',
    tag: 'live',
    displayName: 'Base',
  } satisfies ChainConfig,

  [PresetTypedChainId.BSC]: {
    ...bsc,
    chainType: ChainType.EVM,
    group: 'bsc',
    tag: 'live',
    displayName: 'BSC',
  } satisfies ChainConfig,

  [PresetTypedChainId.Bitlayer]: {
    ...bitlayer,
    chainType: ChainType.EVM,
    group: 'bitlayer',
    tag: 'live',
    displayName: 'Bitlayer',
  } satisfies ChainConfig,

  // Testnet
  [PresetTypedChainId.Goerli]: {
    ...goerli,
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
  } satisfies ChainConfig,

  [PresetTypedChainId.OptimismTestnet]: {
    ...optimismGoerli,
    chainType: ChainType.EVM,
    group: 'optimism',
    tag: 'test',
  } satisfies ChainConfig,

  [PresetTypedChainId.ArbitrumTestnet]: {
    ...arbitrumGoerli,
    chainType: ChainType.EVM,
    group: 'arbitrum',
    tag: 'test',
  } satisfies ChainConfig,

  [PresetTypedChainId.PolygonTestnet]: {
    ...polygonMumbai,
    chainType: ChainType.EVM,
    group: 'polygon',
    tag: 'test',
  } satisfies ChainConfig,

  [PresetTypedChainId.MoonbaseAlpha]: {
    ...moonbaseAlpha,
    chainType: ChainType.EVM,
    group: 'moonbeam',
    tag: 'test',
  } satisfies ChainConfig,

  [PresetTypedChainId.Sepolia]: {
    ...sepolia,
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
    // NOTE: override the default rpcUrls provided by viem.sh to prevent being blocked by CORS policy
    rpcUrls: {
      default: {
        http: ['https://ethereum-sepolia-rpc.publicnode.com'],
      },
      public: {
        http: ['https://ethereum-sepolia-rpc.publicnode.com'],
      },
    },
  },

  [PresetTypedChainId.Holesky]: {
    ...holesky,
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
    // NOTE: override the default rpcUrls provided by viem.sh to prevent being blocked by CORS policy
    rpcUrls: {
      default: {
        http: ['https://ethereum-holesky-rpc.publicnode.com'],
      },
      public: {
        http: ['https://ethereum-holesky-rpc.publicnode.com'],
      },
    },
  } satisfies ChainConfig,

  [PresetTypedChainId.AvalancheFuji]: {
    ...avalancheFuji,
    chainType: ChainType.EVM,
    group: 'avalanche',
    tag: 'test',
  } satisfies ChainConfig,

  [PresetTypedChainId.ScrollSepolia]: {
    ...scrollSepolia,
    chainType: ChainType.EVM,
    group: 'scroll',
    tag: 'test',
  } satisfies ChainConfig,

  [PresetTypedChainId.BaseSepolia]: {
    ...baseSepolia,
    chainType: ChainType.EVM,
    group: 'base',
    tag: 'test',
    displayName: 'Base Sepolia',
  } satisfies ChainConfig,

  [PresetTypedChainId.AnvilLocal]: {
    ...anvilLocal,
    chainType: ChainType.EVM,
    group: 'webb-dev',
    tag: 'dev',
    displayName: 'Anvil Local',
  } satisfies ChainConfig,
} as const satisfies Record<PresetTypedChainId, ChainConfig>;
