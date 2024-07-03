// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import type { Chain } from 'viem/chains';

import type { AppEnvironment } from '../types';

export type ChainGroup =
  | 'arbitrum'
  | 'athena'
  | 'avalanche'
  | 'cosmos'
  | 'ethereum'
  | 'kusama'
  | 'moonbeam'
  | 'optimism'
  | 'orbit'
  | 'phala'
  | 'polkadot'
  | 'polygon'
  | 'scroll'
  | 'tangle'
  | 'webb-dev';

/**
 * The extended chain interface that includes the chain type and group
 */
export type WebbExtendedChain = {
  /**
   * The type of chain (e.g EVM, Substrate, etc)
   */
  chainType: ChainType;

  /**
   * The group of the chain (e.g Ethereum, Polkadot, etc)
   */
  group: ChainGroup;

  /**
   * The tag indicating the network (e.g dev, test, live)
   */
  tag: 'dev' | 'test' | 'live';

  /**
   * The supported environments for this chain (defaults to all)
   */
  env?: AppEnvironment[];
};

export type ChainConfig = Chain & WebbExtendedChain;
