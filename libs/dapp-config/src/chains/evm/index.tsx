// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';
import { ChainType } from '@tangle-network/dapp-types/TypedChainId';
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
  bsc,
  bitlayer,
} from 'viem/chains';
import type { ChainConfig } from '../chain-config.interface';
import tangleLocalEVM from './customChains/tangleLocalEvm';
import tangleMainnetEVM from './customChains/tangleMainnetEVM';
import tangleTestnetEVM from './customChains/tangleTestnetEVM';

export const wagmiChains = [
  mainnet,
  goerli,
  optimismGoerli,
  arbitrumGoerli,
  polygonMumbai,
  moonbaseAlpha,
  sepolia,
  avalancheFuji,
  scrollSepolia,
  tangleMainnetEVM,
  tangleTestnetEVM,
  tangleLocalEVM,
  holesky,
  polygon,
  arbitrum,
  optimism,
  linea,
  base,
  bsc,
  bitlayer,
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

  [PresetTypedChainId.TangleMainnetEVM]: {
    ...tangleMainnetEVM,
    chainType: ChainType.EVM,
    group: 'tangle',
    tag: 'live',
    displayName: 'Tangle Mainnet',
  } satisfies ChainConfig,

  [PresetTypedChainId.TangleTestnetEVM]: {
    ...tangleTestnetEVM,
    chainType: ChainType.EVM,
    group: 'tangle',
    tag: 'test',
    displayName: 'Tangle Testnet',
  } satisfies ChainConfig,

  [PresetTypedChainId.TangleLocalEVM]: {
    ...tangleLocalEVM,
    chainType: ChainType.EVM,
    group: 'tangle',
    tag: 'dev',
    displayName: 'Tangle Local (EVM)',
  } satisfies ChainConfig,
} as const satisfies Record<PresetTypedChainId, ChainConfig>;
