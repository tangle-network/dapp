import type { Evaluate } from '@webb-tools/dapp-types/utils/types';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, switchMap, type Observable } from 'rxjs';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { assetIdsQuery } from '../../queries/restake/assetIds';
import { rewardVaultRxQuery } from '../../queries/restake/rewardVault';
import rewardVaultsPotAccountsRxQuery from '../../queries/restake/rewardVaultsPotAccounts';
import { RestakeAssetId } from '../../types';

export type UseRestakeAssetIdsReturnType = {
  assetIds: RestakeAssetId[];
  assetIds$: Observable<RestakeAssetId[]>;
};

/**
 * Retrieves the whitelisted asset IDs for restaking.
 * The hook returns an object containing the asset IDs and an observable to refresh the asset IDs.
 */
export default function useRestakeAssetIds(): Evaluate<UseRestakeAssetIdsReturnType> {
  const { apiRx } = usePolkadotApi();

  const assetIds$ = useMemo(
    () =>
      rewardVaultsPotAccountsRxQuery(apiRx).pipe(
        switchMap((vaultsPotAccounts) => {
          const vaultIds = vaultsPotAccounts.keys().toArray();

          return rewardVaultRxQuery(apiRx, vaultIds).pipe(
            map((rewardVaults) => assetIdsQuery(rewardVaults)),
          );
        }),
      ),
    [apiRx],
  );

  const assetIds = useObservableState(assetIds$, []);

  return { assetIds, assetIds$ };
}
