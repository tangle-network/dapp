// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType } from '@webb-tools/sdk-core';

import { CurrencyId } from '../enums';
import { ReactElement } from './abstracts';

export interface ChainConfig {
  chainType: ChainType;
  name: string;
  group: string;
  chainId: number;
  tag?: 'dev' | 'test' | 'live';
  url: string;
  evmRpcUrls?: string[];
  blockExplorerStub?: string;
  logo: ReactElement;
  nativeCurrencyId: CurrencyId;
  currencies: Array<CurrencyId>;
}
