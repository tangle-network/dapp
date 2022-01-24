import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { createElement } from 'react';

// The CurrencyType is used to distinguish token responsibilities.
// i.e. an Erc20 type can wrap into a BridgeErc20, but ORML tokens should
// not wrap into BridgeErc20.
export enum CurrencyType {
  Erc20,
  NativeEvm,
  ORML,
  BridgeErc20,
}

export interface CurrencyView {
  id: WebbCurrencyId;
  icon: ReturnType<typeof createElement>;
  type: CurrencyType;
  name: string;
  color?: string;
  symbol: string;
}

export interface CurrencyConfig extends CurrencyView {
  addresses: Map<ChainId, string>;
}
