// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CurrencyRole, CurrencyType } from '@nepoche/dapp-types/Currency';

export interface CurrencyView {
  id: number;
  icon?: any;
  imageUrl?: string;
  type: CurrencyType;
  name: string;
  color?: string;
  decimals: number;
  symbol: string;
}

export interface CurrencyConfig extends CurrencyView {
  addresses: Map<number, string>;
  role: CurrencyRole;
}
