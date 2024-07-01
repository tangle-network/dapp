// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import {
  arbitrumGoerli,
  avalancheFuji,
  goerli,
  moonbaseAlpha,
  optimismGoerli,
  polygonMumbai,
  scrollSepolia,
  sepolia,
} from 'viem/chains';
import type { ChainConfig } from '../chain-config.interface';
import athenaLocalnet from './customChains/athenaLocalnet';
import demeterLocalnet from './customChains/demeterLocalnet';
import hermesLocalnet from './customChains/hermesLocalnet';
import tangleLocalEVM from './customChains/tangleLocalEvm';
import tangleMainnetEVM from './customChains/tangleMainnetEVM';
import tangleTestnetEVM from './customChains/tangleTestnetEVM';

export const wagmiChains = [
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
] as const;

export const chainsConfig = {
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
  } satisfies ChainConfig,

  [PresetTypedChainId.TangleTestnetEVM]: {
    ...tangleTestnetEVM,
    chainType: ChainType.EVM,
    group: 'tangle',
    tag: 'test',
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
