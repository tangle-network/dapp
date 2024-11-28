// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
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
} from 'viem/chains';
import type { ChainConfig } from '../chain-config.interface';
import athenaLocalnet from './customChains/athenaLocalnet';
import demeterLocalnet from './customChains/demeterLocalnet';
import hermesLocalnet from './customChains/hermesLocalnet';
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
  hermesLocalnet,
  athenaLocalnet,
  demeterLocalnet,
  holesky,
  polygon,
  arbitrum,
  optimism,
  linea,
  base,
  bsc,
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
    displayName: 'Tangle',
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
  } satisfies ChainConfig,

  // Localnet
  [PresetTypedChainId.HermesLocalnet]: {
    ...hermesLocalnet,
    chainType: ChainType.EVM,
    group: 'webb-dev',
    tag: 'dev',
    env: ['development'],
  } satisfies ChainConfig,

  [PresetTypedChainId.AthenaLocalnet]: {
    ...athenaLocalnet,
    chainType: ChainType.EVM,
    group: 'webb-dev',
    tag: 'dev',
    env: ['development'],
  } satisfies ChainConfig,

  [PresetTypedChainId.DemeterLocalnet]: {
    ...demeterLocalnet,
    chainType: ChainType.EVM,
    group: 'webb-dev',
    tag: 'dev',
    env: ['development'],
  } satisfies ChainConfig,
} as const satisfies Record<number, ChainConfig>;
