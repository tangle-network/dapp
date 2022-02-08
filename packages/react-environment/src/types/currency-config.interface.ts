import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { createElement } from 'react';

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
  id: WebbCurrencyId;
  icon: ReturnType<typeof createElement>;
  imageUrl?: string;
  type: CurrencyType;
  name: string;
  color?: string;
  symbol: string;
}

export interface CurrencyConfig extends CurrencyView {
  addresses: Map<ChainId, string>;
  role: CurrencyRole;
}
