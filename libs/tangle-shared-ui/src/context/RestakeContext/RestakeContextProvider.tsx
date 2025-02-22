'use client';

import toPairs from 'lodash/toPairs';
import { PropsWithChildren, useCallback, useMemo } from 'react';
import useRestakeAssets from '../../data/restake/useRestakeAssets';
import useRestakeAssetBalances from '../../data/restake/useRestakeAssetBalances';
import { AssetWithBalance } from '../../types/restake';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import RestakeContext from './RestakeContext';

const RestakeContextProvider = (props: PropsWithChildren) => {
  const assets = useRestakeAssets();

  const { balances, refetchErc20Balances: refetchErc20BalancesFn } =
    useRestakeAssetBalances();

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
      {} satisfies AssetWithBalance,
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
        refetchErc20Balances,
      }}
      {...props}
    />
  );
};

export default RestakeContextProvider;
