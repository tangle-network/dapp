'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import toPairs from 'lodash/toPairs';
import { useObservableState } from 'observable-hooks';
import { PropsWithChildren, useMemo } from 'react';
import { combineLatest, map } from 'rxjs';
import useRestakeVaults from '../../data/restake/useRestakeVaults';
import useRestakeBalances from '../../data/restake/useRestakeBalances';
import { AssetWithBalance } from '../../types/restake';
import RestakeContext from './RestakeContext';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';

const RestakeContextProvider = (props: PropsWithChildren) => {
  const { vaults, vaults$ } = useRestakeVaults();
  const { balances, balances$ } = useRestakeBalances();

  const assetWithBalances$ = useMemo(
    () =>
      combineLatest([vaults$, balances$]).pipe(
        map(([assetMap, balances]) => {
          const combined = toPairs(assetMap).reduce(
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
    [vaults$, balances$],
  );

  const assetWithBalances = useObservableState(assetWithBalances$, []);

  return (
    <RestakeContext.Provider
      value={{
        assetWithBalances,
        assetWithBalances$,
        vaults,
        vaults$,
        balances,
        balances$,
      }}
      {...props}
    />
  );
};

export default RestakeContextProvider;
