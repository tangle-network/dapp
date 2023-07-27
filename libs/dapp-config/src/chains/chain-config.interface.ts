// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType } from '@webb-tools/sdk-core';
import type { Chain } from '@wagmi/chains';

import { AppEnvironment } from '../types';

export type ChainGroup =
  | 'arbitrum'
  | 'athena'
  | 'avalanche'
  | 'cosmos'
  | 'ethereum'
  | 'kusama'
  | 'moonbeam'
  | 'optimism'
  | 'polkadot'
  | 'polygon'
  | 'scroll'
  | 'tangle'
  | 'orbit'
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

  /**
   * The contracts for this chain
   */
  contracts?: Chain['contracts'];
};

export type ChainConfig = Chain & WebbExtendedChain;
