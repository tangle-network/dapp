// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType } from '@webb-tools/sdk-core';

export type ChainBase =
  | 'polygon'
  | 'ethereum'
  | 'optimism'
  | 'kusama'
  | 'moonbeam'
  | 'polkadot'
  | 'arbitrum'
  | 'avalanche'
  | 'tangle'
  | 'scroll'
  | 'webb-dev';

export interface ChainConfig {
  chainType: ChainType;
  name: string;
  base?: ChainBase;
  group: string;
  chainId: number;
  tag: 'dev' | 'test' | 'live';
  url: string;
  evmRpcUrls?: string[];
  blockExplorerStub?: string;
  logo: React.ComponentType | React.ElementType;
}
