import { useEffect, useReducer } from 'react';
import { ApiRx } from '@polkadot/api';
import { Observable, from } from 'rxjs';
import { map, filter, mergeMap, startWith } from 'rxjs/operators';
import { FixedPointNumber } from '@acala-network/sdk-core';

import { TimestampedValue } from '@open-web3/orml-types/interfaces';
import { OracleKey } from '@acala-network/types/interfaces';
import { useApi } from '@webb-dapp/react-hooks';

export type OracleProvider = 'Aggregated' | 'Acala' | 'Band';

export type OraclePriceData = {
  currency: string;
  price: FixedPointNumber;
}[];

type OraclePriceAction = {
  type: 'update';
  value: {
    provider: OracleProvider;
    data: OraclePriceData;
  };
};

type OraclePriceState = Record<OracleProvider, OraclePriceData>;

const initState: OraclePriceState = {
  Acala: [],
  Aggregated: [],
  Band: []
};

const reducer = (state: OraclePriceState, action: OraclePriceAction): OraclePriceState => {
  switch (action.type) {
    case 'update': {
      return {
        ...state,
        [action.value.provider]: action.value.data
      };
    }
  }

  return state;
};

export const getOraclePrices = (api: ApiRx, type: OracleProvider = 'Aggregated'): Observable<OraclePriceData> => {
  return ((api.rpc as any).oracle.getAllValues(type) as Observable<[[OracleKey, TimestampedValue]]>).pipe(
    map((result) => {
      return result.map((item) => {
        return {
          currency: item[0].asToken.toString(),
          price: FixedPointNumber.fromInner((item[1]?.value as any)?.value?.toString() || '0')
        };
      });
    })
  );
};

export const subscribeOraclePrices = (api: ApiRx, type: OracleProvider = 'Aggregated'): ReturnType<typeof getOraclePrices> => {
  return api.query.system.events().pipe(
    startWith([{ event: { method: 'NewFeedData' } }]),
    mergeMap((events) => {
      return from(events).pipe(
        // if oracle has new feed data, reflash oracle prices
        filter((record) => {
          const { event } = record;

          return event.method === 'NewFeedData';
        }),
        mergeMap(() => getOraclePrices(api, type))
      );
    })
  );
};

export const useOraclePricesStore = (): OraclePriceState => {
  const { api } = useApi();
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    if (!api || !api.isConnected) return;

    const subscription1 = subscribeOraclePrices(api, 'Acala').subscribe((result) => {
      dispatch({
        type: 'update',
        value: { data: result, provider: 'Acala' }
      });
    });

    const subscription2 = subscribeOraclePrices(api, 'Aggregated').subscribe((result) => {
      dispatch({
        type: 'update',
        value: { data: result, provider: 'Aggregated' }
      });
    });

    const subscription3 = subscribeOraclePrices(api, 'Band').subscribe((result) => {
      dispatch({
        type: 'update',
        value: { data: result, provider: 'Band' }
      });
    });

    return (): void => {
      subscription1.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
    };
  }, [api]);

  return state;
};
