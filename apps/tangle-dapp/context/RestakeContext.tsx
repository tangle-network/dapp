'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';
import { type Observable, of } from 'rxjs';

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
  const { assetMap, assetMap$ } = useRestakeAssetMap();

  const { balances, balances$ } = useRestakeBalances();

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
