import { useMemo } from 'react';

import { CurrencyId } from '@acala-network/types/interfaces';
import { FixedPointNumber } from '@acala-network/sdk-core';

import { useStore } from '@webb-dapp/react-environment';

export interface PriceData {
  currency: string;
  price: FixedPointNumber;
}

/**
 * @name useAllPrices
 * @description get all prices from the chain
 */
export const useAllPrices = (): PriceData[] => {
  const { prices } = useStore('prices');

  return useMemo(() => {
    const result: PriceData[] = [];

    prices.forEach((value, key) => {
      result.push({ currency: key, price: value });
    });

    return result;
  }, [prices]);
};

/**
 * @name usePrice
 * @description get price of `currency`
 * @param currency
 */
export const usePrice = (currency?: CurrencyId): FixedPointNumber => {
  const { prices } = useStore('prices');

  if (!currency || !prices) return FixedPointNumber.ZERO;

  if (currency.isDexShare) return FixedPointNumber.ZERO;

  return prices.get(currency.asToken.toString()) || FixedPointNumber.ZERO;
};
