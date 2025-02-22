'use client';

import { PropsWithChildren, useCallback, useMemo } from 'react';
import useRestakeAssets from '../../data/restake/useRestakeAssets';
import useRestakeAssetBalances from '../../data/restake/useRestakeAssetBalances';
import { RestakeAssetMap } from '../../types/restake';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import RestakeContext from './RestakeContext';

// TODO: Consider using Zustand store instead of React context. Or even, get rid of and just use `useRestakeAssets` directly.
const RestakeContextProvider = (props: PropsWithChildren) => {
  const assets = useRestakeAssets();

  const { balances, refetchErc20Balances: refetchErc20BalancesFn } =
    useRestakeAssetBalances();

  const assetWithBalances = useMemo(() => {
    if (assets === null) {
      return null;
    }

    const map = new Map() satisfies RestakeAssetMap as RestakeAssetMap;

    for (const [assetIdString, metadata] of assets.entries()) {
      const assetId = assertRestakeAssetId(assetIdString);
      const balance = balances[assetIdString];

      map.set(assetId, {
        assetId,
        metadata,
        // TODO: Scale bigint to BN using appropriate decimals.
        balance: balance?.balance,
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
        assets: assetWithBalances,
        refetchErc20Balances,
      }}
      {...props}
    />
  );
};

export default RestakeContextProvider;
