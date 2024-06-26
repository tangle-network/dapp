'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import orderBy from 'lodash/orderBy';
import toPairs from 'lodash/toPairs';
import { useObservableState } from 'observable-hooks';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { combineLatest, map, type Observable, of } from 'rxjs';

import useRestakeAssetMap from '../data/restake/useRestakeAssetMap';
import useRestakeBalances from '../data/restake/useRestakeBalances';
import type {
  AssetBalanceMap,
  AssetMap,
  AssetWithBalance,
} from '../types/restake';

type RestakeContextType = {
  /**
   * The asset map for the current selected chain
   */
  assetMap: AssetMap;

  /**
   * An observable of the asset map for the current selected chain
   */
  assetMap$: Observable<AssetMap>;

  /**
   * The balances of the current active account
   */
  balances: AssetBalanceMap;

  /**
   * An observable of the balances of the current active account
   */
  balances$: Observable<AssetBalanceMap>;

  /**
   * An observable of assets with balances of the current active account
   */
  assetWithBalances$: Observable<Array<AssetWithBalance>>;

  /**
   * The assets with balances of the current active account
   */
  assetWithBalances: Array<AssetWithBalance>;
};

const Context = createContext<RestakeContextType>({
  assetMap: {},
  assetMap$: of<AssetMap>({}),
  balances: {},
  balances$: of<AssetBalanceMap>({}),
  assetWithBalances: [],
  assetWithBalances$: of([]),
});

const RestakeContextProvider = (props: PropsWithChildren) => {
  const { assetMap, assetMap$ } = useRestakeAssetMap();

  const { balances, balances$ } = useRestakeBalances();

  const assetWithBalances$ = useMemo(
    () =>
      combineLatest([assetMap$, balances$]).pipe(
        map(([assetMap, balances]) => {
          return orderBy(
            toPairs(assetMap).reduce(
              (assetWithBalances, [assetId, assetMetadata]) => {
                const balance = balances[assetId] ?? null;

                return assetWithBalances.concat({
                  assetId,
                  metadata: assetMetadata,
                  balance,
                });
              },
              [] as Array<AssetWithBalance>,
            ),
            ({ balance }) => balance?.balance ?? ZERO_BIG_INT,
            'desc',
          );
        }),
      ),
    [assetMap$, balances$],
  );

  const assetWithBalances = useObservableState(assetWithBalances$, []);

  return (
    <Context.Provider
      value={{
        assetWithBalances,
        assetWithBalances$,
        assetMap,
        assetMap$,
        balances,
        balances$,
      }}
      {...props}
    />
  );
};

const useRestakeContext = () => useContext(Context);

export type { RestakeContextType };

export { RestakeContextProvider, useRestakeContext };
