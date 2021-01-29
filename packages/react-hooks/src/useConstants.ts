import { useMemo } from 'react';

import { CurrencyId, TradingPair } from '@webb-tools/types/interfaces';
import { Vec } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';

import { useApi } from './useApi';
import { Fixed18, convertToFixed18 } from '@webb-tools/app-util';

const LOAN_CURRENCIES_WEIGHT = new Map<string, number>([
  ['DOT', 9],
  ['RENBTC', 8],
  ['LDOT', 7],
  ['XBTC', 6]
]);

const CURRENCIES_WEIGHT = new Map<string, number>([
  ['ACA', 9],
  ['AUSD', 8],
  ['DOT', 7],
  ['RENBTC', 6],
  ['LDOT', 5],
  ['XBTC', 4]
]);

export type HooksReturnType = {
  allCurrencies: CurrencyId[];
  crossChainCurrencies: CurrencyId[];
  dexTradingPair: TradingPair[];
  loanCurrencies: CurrencyId[];
  expectedBlockTime: number;
  nativeCurrency: CurrencyId;
  minmumDebitValue: Fixed18;
  stableCurrency: CurrencyId;
  stakingCurrency: CurrencyId;
  liquidCurrency: CurrencyId;
  [key: string]: any;
};

export const useConstants = (): HooksReturnType => {
  const { api } = useApi();

  // all currencies id
  const allCurrencies = useMemo((): CurrencyId[] => {
    const tokenList = (api.registry.createType('TokenSymbol' as any).defKeys as string[]).sort(
      (a, b): number => (CURRENCIES_WEIGHT.get(b.toString()) || 0) - (CURRENCIES_WEIGHT.get(a.toString()) || 0)
    );

    return tokenList.map(
      (name: string): CurrencyId => {
        return api.registry.createType('CurrencyId' as any, { Token: name }) as CurrencyId;
      }
    );
  }, [api]);

  const crossChainCurrencies = useMemo((): CurrencyId[] => {
    return ['edg', 'hedg', 'dot', 'ksm'].map(
      (name: string): CurrencyId => {
        return api.registry.createType('CurrencyId' as any, { Token: name }) as CurrencyId;
      }
    );
  }, [api]);

  return {
    allCurrencies,
    crossChainCurrencies,
    dexTradingPair: [],
    expectedBlockTime: 6_000,
    liquidCurrency: null!,
    loanCurrencies: [],
    minmumDebitValue: null!,
    nativeCurrency: null!,
    stableCurrency: null!,
    stakingCurrency: null!,
    ...api.consts
  };
};
