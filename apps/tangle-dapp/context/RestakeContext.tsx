'use client';

import { useSubscription } from 'observable-hooks';
import { createContext, type PropsWithChildren, useContext } from 'react';

import useRestakeAssetMap from '../data/restake/useRestakeAssetMap';
import useRestakeBalances from '../data/restake/useRestakeBalances';
import { useActions } from '../stores/deposit';
import { AssetBalanceMap, AssetMap } from '../types/restake';

type RestakeContextType = {
  /**
   * The asset map for the current selected chain
   */
  assetMap: AssetMap;

  /**
   * The balances of the current active account
   */
  balances: AssetBalanceMap;
};

const Context = createContext<RestakeContextType>({
  assetMap: {},
  balances: {},
});

const RestakeContextProvider = (props: PropsWithChildren) => {
  const { assetMap, assetMap$ } = useRestakeAssetMap();

  const { balances } = useRestakeBalances();

  const { updateDepositAssetId } = useActions();

  // Subscribe to assetMap$ and update depositAssetId to the first assetId
  useSubscription(assetMap$, (assetMap) => {
    if (Object.keys(assetMap).length === 0) {
      return;
    }

    const defaultAssetId = Object.keys(assetMap)[0];
    updateDepositAssetId(defaultAssetId);
  });

  return <Context.Provider value={{ assetMap, balances }} {...props} />;
};

const useRestakeContext = () => useContext(Context);

export type { RestakeContextType };

export { RestakeContextProvider, useRestakeContext };
