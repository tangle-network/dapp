import { useState, useEffect, useMemo } from 'react';
import { combineLatest } from 'rxjs';
import { Option } from '@polkadot/types';

import { Price } from '@open-web3/orml-types/interfaces';
import { FixedPointNumber } from '@webb-tools/sdk-core';

import { tokenEq } from '@webb-dapp/react-components';

import { useApi } from './useApi';
import { CurrencyLike } from './types';
import { useStakingPool } from './stakingPoolHooks';

export type LockedPricesResult = { [k: string]: FixedPointNumber };

export function useLockPrices(): LockedPricesResult {
  const { api } = useApi();
  const oracleCurrencies = useMemo(() => ['DOT', 'XBTC', 'RENBTC'], []);
  const [prices, setPrices] = useState<LockedPricesResult>({});
  const stakingPool = useStakingPool();

  useEffect(() => {
    if (!api || !oracleCurrencies || !stakingPool) return;

    const subscriber = combineLatest(
      oracleCurrencies.map((currency: CurrencyLike) => api.query.prices.lockedPrice<Option<Price>>({ token: currency }))
    ).subscribe((result: Option<Price>[]): void => {
      const priceList: LockedPricesResult = {};

      result.forEach((price: Option<Price>, index: number): void => {
        priceList[oracleCurrencies[index].toString()] = FixedPointNumber.fromInner(price.toString());

        if (tokenEq(oracleCurrencies[index], stakingPool.derive.liquidCurrency)) {
          const exchangeRate = stakingPool.stakingPool.liquidExchangeRate();
          const liquidPrice = FixedPointNumber.fromInner(price.toString()).times(exchangeRate);

          priceList[stakingPool.derive.liquidCurrency.toString()] = liquidPrice;
        }
      });
      setPrices(priceList);
    });

    return (): void => subscriber.unsubscribe();
  }, [api, oracleCurrencies, stakingPool]);

  return prices;
}
