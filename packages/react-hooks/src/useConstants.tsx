import { CurrencyId } from '@nepoche/types/interfaces';
import { useMemo } from 'react';

import { useApi } from './useApi';

const CURRENCIES_WEIGHT = new Map<string, number>([['EDG', 9]]);

export type HooksReturnType = {
  allCurrencies: CurrencyId[];
  [key: string]: any;
};

export const useConstants = (): HooksReturnType => {
  // all currencies id
  const allCurrencies = useMemo((): CurrencyId[] => {
    return [];
  }, []);

  return {
    allCurrencies,
  };
};
