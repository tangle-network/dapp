// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CurrencyId } from '../enums';
import { ReactElement } from './abstracts';

// The CurrencyType distinguishes how to interact with a particular currency in terms of
// web3 api calls.
export enum CurrencyType {
  ERC20,
  NATIVE,
  ORML,
}

// The CurrencyRole distinguishes how a currency may interact in the webb application
// - Wrappable refers to a currency that may be converted into a webbToken
// - Governable refers to a currency that supports the wrapping of 'Wrappable' currencies,
//   which can be modified from governance.
export enum CurrencyRole {
  Wrappable,
  Governable,
}

export interface CurrencyView {
  id: CurrencyId;
  icon: ReactElement;
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
