import { FixedPointNumber } from '@acala-network/sdk-core';
import { useState, useEffect } from 'react';
import { combineLatest } from 'rxjs';
import { Balance, CurrencyId } from '@acala-network/types/interfaces';
import { getDexShareFromCurrencyId, tokenEq } from '@webb-dapp/react-components';

import { useConstants } from './useConstants';
import { WithNull } from './types';
import { useAllPrices } from './priceHooks';
import { useApi } from './useApi';

interface SwapOverview {
  total: FixedPointNumber;
  details: {
    currency: CurrencyId;
    token1: CurrencyId;
    token2: CurrencyId;
    token1Amount: FixedPointNumber;
    token2Amount: FixedPointNumber;
    value: FixedPointNumber;
  }[];
}

/**
 * @name useSwapOverview
 * @description query all dex token pairs information
 */
export const useSwapOverview = (): WithNull<SwapOverview> => {
  const { api } = useApi();
  const { dexTradingPair } = useConstants();
  const prices = useAllPrices();
  const [result, setResult] = useState<WithNull<SwapOverview>>(null);

  useEffect(() => {
    if (!api) return;

    combineLatest(dexTradingPair.map((item) => api.query.dex.liquidityPool<[Balance, Balance]>(item))).subscribe((result: [Balance, Balance][]): void => {
      const details = result.map((item, index) => {
        const currency = getDexShareFromCurrencyId(api, dexTradingPair[index][0], dexTradingPair[index][1]);
        const [token1, token2] = dexTradingPair[index];

        const token1Price = prices.find((item) => tokenEq(token1, item.currency))?.price || FixedPointNumber.ZERO;
        const token2Price = prices.find((item) => tokenEq(token2, item.currency))?.price || FixedPointNumber.ZERO;
        const token1Amount = FixedPointNumber.fromInner(item[0] ? item[0].toString() : 0);
        const token2Amount = FixedPointNumber.fromInner(item[1] ? item[1].toString() : 0);
        const value = token1Amount.times(token1Price).plus(token2Amount.times(token2Price));

        return {
          currency,
          token1,
          token1Amount,
          token2,
          token2Amount,
          value
        };
      });

      const total = details.reduce((pre, cur) => pre.plus(cur.value), FixedPointNumber.ZERO);

      setResult({ details, total });
    });
  }, [api, dexTradingPair, prices]);

  return result;
};
