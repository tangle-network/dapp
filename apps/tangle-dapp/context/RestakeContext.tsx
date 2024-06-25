'use client';

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
import type { AssetBalanceMap, AssetMap } from '../types/restake';

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
};

const Context = createContext<RestakeContextType>({
  assetMap: {},
  assetMap$: of<AssetMap>({}),
  balances: {},
  balances$: of<AssetBalanceMap>({}),
});

const RestakeContextProvider = (props: PropsWithChildren) => {
  const { assetMap: assetMapRaw, assetMap$: assetMapRaw$ } =
    useRestakeAssetMap();

  const { balances, balances$ } = useRestakeBalances();

  const assetMap$ = useMemo(
    () =>
      combineLatest([assetMapRaw$, balances$]).pipe(
        map(([assetMap, balances]) => {
          const sortedEntries = Object.entries(assetMap)
            .slice()
            .sort((assetA, assetB) => {
              const balanceA = balances[assetA[0]]?.balance ?? 0;
              const balanceB = balances[assetB[0]]?.balance ?? 0;

              if (balanceA === balanceB) {
                return 0;
              }

              return balanceA > balanceB ? -1 : 1;
            });

          return Object.fromEntries(
            sortedEntries,
          ) satisfies AssetMap as AssetMap;
        }),
      ),
    [assetMapRaw$, balances$],
  );

  const assetMap = useObservableState(assetMap$, assetMapRaw);

  return (
    <Context.Provider
      value={{ assetMap, assetMap$, balances, balances$ }}
      {...props}
    />
  );
};

const useRestakeContext = () => useContext(Context);

export type { RestakeContextType };

export { RestakeContextProvider, useRestakeContext };
