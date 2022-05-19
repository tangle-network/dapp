// @ts-ignore
import { CurrencyId } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';

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
