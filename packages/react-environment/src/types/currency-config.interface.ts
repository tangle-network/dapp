import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { createElement } from 'react';

export enum CurrencyType {
  WrappableEvmCurrency,
  OrmlCurrency,
  BridgeCurrency,
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
