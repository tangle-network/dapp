import { PropsWithChildren, useMemo } from 'react';
import useRestakeAssetMap from '../../data/restake/useRestakeAssetMap';
import useRestakeBalances from '../../data/restake/useRestakeBalances';
import { combineLatest, map } from 'rxjs';
import toPairs from 'lodash/toPairs';
import { AssetWithBalance } from '../../types/restake';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { useObservableState } from 'observable-hooks';
import RestakeContext from './RestakeContext';

const RestakeContextProvider = (props: PropsWithChildren) => {
  const { assetMap, assetMap$ } = useRestakeAssetMap();

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
        assetMap,
        assetMap$,
        balances,
        balances$,
      }}
      {...props}
    />
  );
};

export default RestakeContextProvider;
