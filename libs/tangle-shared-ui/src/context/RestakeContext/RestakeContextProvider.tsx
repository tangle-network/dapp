'use client';

import toPairs from 'lodash/toPairs';
import { PropsWithChildren, useCallback, useMemo } from 'react';
import useRestakeAssets from '../../data/restake/useRestakeAssets';
import useRestakeBalances from '../../data/restake/useRestakeBalances';
import { AssetWithBalance } from '../../types/restake';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import RestakeContext from './RestakeContext';

const RestakeContextProvider = (props: PropsWithChildren) => {
  const {
    assets,
    isLoading: vaultsLoading,
    error: vaultsError,
  } = useRestakeAssets();

  const {
    balances,
    isLoading: balancesLoading,
    error: balancesError,
    refetchErc20Balances: refetchErc20BalancesFn,
  } = useRestakeBalances();

  const assetWithBalances = useMemo(() => {
    return toPairs(assets).reduce(
      (assetWithBalances, [assetIdString, metadata]) => {
        const assetId = assertRestakeAssetId(assetIdString);
        const balance = balances[assetId] ?? null;

        return {
          ...assetWithBalances,
          [assetId]: {
            assetId,
            metadata,
            balance,
          },
        };
      },
      {} as AssetWithBalance,
    );
  }, [assets, balances]);

  const refetchErc20Balances = useCallback(async () => {
    await refetchErc20BalancesFn();
  }, [refetchErc20BalancesFn]);

  return (
    <RestakeContext.Provider
      value={{
        assetWithBalances,
        assets,
        balances,
        isLoading: vaultsLoading || balancesLoading,
        error: vaultsError || balancesError,
        refetchErc20Balances,
      }}
      {...props}
    />
  );
};

export default RestakeContextProvider;
