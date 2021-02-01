import { useMemo } from 'react';

import { CurrencyId } from '@webb-tools/types/interfaces';

import { useApi } from './useApi';

const CURRENCIES_WEIGHT = new Map<string, number>([['EDG', 9]]);

export type HooksReturnType = {
  allCurrencies: CurrencyId[];
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

  return {
    allCurrencies,
    ...api.consts,
  };
};
