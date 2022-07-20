// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType } from '@webb-tools/sdk-core';

import { WebbCurrencyId } from '../enums';
import { ReactElement } from './abstracts';

export interface ChainConfig {
  id: number;
  chainType: ChainType;
  name: string;
  group: string;
  chainId: number;
  tag?: 'dev' | 'test' | 'live';
  url: string;
  evmRpcUrls?: string[];
  blockExplorerStub?: string;
  logo: ReactElement;
  nativeCurrencyId: WebbCurrencyId;
  currencies: Array<WebbCurrencyId>;
}
