// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CurrencyId } from '@webb-tools/dapp-types';
import { ChainType } from '@webb-tools/sdk-core';

export interface ChainConfig {
  chainType: ChainType;
  name: string;
  group: string;
  chainId: number;
  tag?: 'dev' | 'test' | 'live';
  url: string;
  evmRpcUrls?: string[];
  blockExplorerStub?: string;
  logo: React.ElementType;
  nativeCurrencyId: CurrencyId;
  currencies: Array<CurrencyId>;
}
