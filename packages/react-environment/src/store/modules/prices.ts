import { useEffect, useReducer } from 'react';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';
import { ApiRx } from '@polkadot/api';

import { DerivedDexPool } from '@webb-tools/api-derive';
import { useApi } from '@webb-dapp/react-hooks';
import { getCurrencyIdFromName } from '@webb-dapp/react-components';

import { subscribeOraclePrices } from './oracle-prices';
import { subscribeStakingPool } from './staking';

export type PriceData = Map<string, FixedPointNumber>;

type PriceAction = {
  type: 'update';
  value: Map<CurrencyId, FixedPointNumber>;
};

type PriceState = {
  prices: PriceData;
};

const initState: PriceState = {
  prices: new Map<string, FixedPointNumber>()
};

const reducer = (state: PriceState, action: PriceAction): PriceState => {
  switch (action.type) {
    case 'update': {
      const data = new Map();

      state.prices.forEach((value, key) => data.set(key.toString(), value));
      action.value.forEach((value, key) => data.set(key.asToken.toString(), value));

      return { prices: data };
    }
  }
};

const subscribeDexPrices = (api: ApiRx): Observable<{ currency: CurrencyId; price: FixedPointNumber }> => {
  const nativeCurrency = getCurrencyIdFromName(api, 'ACA');
  const aUSDCurrency = getCurrencyIdFromName(api, 'AUSD');

  return ((api.derive as any).dex.pool(nativeCurrency, aUSDCurrency) as Observable<DerivedDexPool>).pipe(
    map((result) => {
      return {
        currency: nativeCurrency,
        price: FixedPointNumber.fromInner(result[1].toString()).div(FixedPointNumber.fromInner(result[0].toString()))
      };
    })
  );
};

export const usePricesStore = (): PriceState => {
  const { api } = useApi();
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    if (!api || !api.isConnected) return;

    // set aUSD price to 1
    dispatch({
      type: 'update',
      value: new Map([[getCurrencyIdFromName(api, 'AUSD'), FixedPointNumber.ONE]])
    });

    const subscription1 = subscribeOraclePrices(api, 'Aggregated').subscribe((result) => {
      const data = new Map<CurrencyId, FixedPointNumber>();

      result.forEach(({ currency, price }) => {
        data.set(getCurrencyIdFromName(api, currency), price);
      });

      dispatch({ type: 'update', value: data });
    });

    const subscription2 = subscribeDexPrices(api).subscribe((result) => {
      const data = new Map<CurrencyId, FixedPointNumber>([[result.currency, result.price]]);

      dispatch({ type: 'update', value: data });
    });

    const subscription3 = subscribeStakingPool(api).subscribe((result) => {
      const exchangeRate = result.stakingPool.liquidExchangeRate();
      const stakingCurrencyPrice = state.prices.get(result.derive.stakingCurrency.asToken.toString());

      if (!stakingCurrencyPrice) return;

      const price = stakingCurrencyPrice.times(exchangeRate);

      dispatch({ type: 'update', value: new Map([[result.derive.liquidCurrency, price]]) });
    });

    return (): void => {
      subscription1.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
    };
  // state.price change should not trigger effect
  /* eslint-disable-next-line */
  }, [api]);

  return state;
};
