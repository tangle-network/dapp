'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import toPairs from 'lodash/toPairs';
import { useObservableState } from 'observable-hooks';
import { PropsWithChildren, useMemo } from 'react';
import { combineLatest, map } from 'rxjs';
import useRestakeVaultAssets from '../../data/restake/useRestakeVaultAssets';
import useRestakeBalances from '../../data/restake/useRestakeBalances';
import { AssetWithBalance } from '../../types/restake';
import RestakeContext from './RestakeContext';

const RestakeContextProvider = (props: PropsWithChildren) => {
  const { vaultAssets: assetMap, assetMap$ } = useRestakeVaultAssets();
  const { balances, balances$ } = useRestakeBalances();

  const assetWithBalances$ = useMemo(
    () =>
      combineLatest([assetMap$, balances$]).pipe(
        map(([assetMap, balances]) => {
          const combined = toPairs(assetMap).reduce(
            (assetWithBalances, [assetId, assetMetadata]) => {
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
                isDefined(asset.balance) &&
                asset.balance.balance > ZERO_BIG_INT,
            ),
            ...combined.filter(
              (asset) =>
                !isDefined(asset.balance) ||
                asset.balance.balance === ZERO_BIG_INT,
            ),
          ];
        }),
      ),
    [assetMap$, balances$],
  );

  const assetWithBalances = useObservableState(assetWithBalances$, []);

  return (
    <RestakeContext.Provider
      value={{
        assetWithBalances,
        assetWithBalances$,
        assetMetadataMap: assetMap,
        assetMap$,
        balances,
        balances$,
      }}
      {...props}
    />
  );
};

export default RestakeContextProvider;
