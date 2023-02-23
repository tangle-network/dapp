// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CurrencyRole, CurrencyType } from '@webb-tools/dapp-types/Currency';

export interface CurrencyView {
  id: number;
  type: CurrencyType;
  name: string;
  decimals: number;
  symbol: string;
}

export interface CurrencyConfig extends CurrencyView {
  addresses: Map<number, string>;
  role: CurrencyRole;
}
