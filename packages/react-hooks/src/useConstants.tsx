import { CurrencyId } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';

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
    return [];
  }, [api]);

  return {
    allCurrencies,
    ...api.consts,
  };
};
