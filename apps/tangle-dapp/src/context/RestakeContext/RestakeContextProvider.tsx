import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import useRestakeVaults from '@webb-tools/tangle-shared-ui/data/restake/useRestakeVaults';
import useRestakeBalances from '@webb-tools/tangle-shared-ui/data/restake/useRestakeBalances';
import { AssetWithBalance } from '@webb-tools/tangle-shared-ui/types/restake';
import toPairs from 'lodash/toPairs';
import { useObservableState } from 'observable-hooks';
import { PropsWithChildren, useMemo } from 'react';
import { combineLatest, map } from 'rxjs';
import RestakeContext from './RestakeContext';
import assertRestakeAssetId from '@webb-tools/tangle-shared-ui/utils/assertRestakeAssetId';

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
        assetMap: vaults,
        assetMap$: vaults$,
        balances,
        balances$,
      }}
      {...props}
    />
  );
};

export default RestakeContextProvider;
