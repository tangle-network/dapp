'use client';

import { PropsWithChildren, useCallback, useMemo } from 'react';
import useRestakeAssets from '../../data/restake/useRestakeAssets';
import useRestakeAssetBalances from '../../data/restake/useRestakeAssetBalances';
import { RestakeAssetMapWithBalances } from '../../types/restake';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import RestakeContext from './RestakeContext';

const RestakeContextProvider = (props: PropsWithChildren) => {
  const assets = useRestakeAssets();

  const { balances, refetchErc20Balances: refetchErc20BalancesFn } =
    useRestakeAssetBalances();

  const assetWithBalances = useMemo(() => {
    if (assets === null) {
      return null;
    }

    const map =
      new Map() satisfies RestakeAssetMapWithBalances as RestakeAssetMapWithBalances;

    for (const [assetIdString, metadata] of assets.entries()) {
      const assetId = assertRestakeAssetId(assetIdString);
      const balance = balances[assetIdString] ?? null;

      map.set(assetId, {
        assetId,
        metadata,
        balance,
      });
    }

    return map;
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
