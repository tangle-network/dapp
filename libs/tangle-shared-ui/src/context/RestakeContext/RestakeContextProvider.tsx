'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import toPairs from 'lodash/toPairs';
import { PropsWithChildren, useMemo } from 'react';
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
  } = useRestakeBalances();

  const assetWithBalances = useMemo(() => {
    const combined = toPairs(assets).reduce(
      (assetWithBalances, [assetIdString, assetMetadata]) => {
        const assetId = assertRestakeAssetId(assetIdString);
        const balance = balances[assetId] ?? null;

        return assetWithBalances.concat({
          assetId,
          metadata: assetMetadata,
          balance,
        });
      },
      [] as Array<AssetWithBalance>,
    );

    // Order assets with balances first
    return [
      ...combined.filter(
        (asset) =>
          isDefined(asset.balance) && asset.balance.balance > ZERO_BIG_INT,
      ),
      ...combined.filter(
        (asset) =>
          !isDefined(asset.balance) || asset.balance.balance === ZERO_BIG_INT,
      ),
    ];
  }, [assets, balances]);

  return (
    <RestakeContext.Provider
      value={{
        assetWithBalances,
        assets,
        balances,
        isLoading: vaultsLoading || balancesLoading,
        error: vaultsError || balancesError,
      }}
      {...props}
    />
  );
};

export default RestakeContextProvider;
