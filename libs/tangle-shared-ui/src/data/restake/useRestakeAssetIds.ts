import type { Evaluate } from '@webb-tools/dapp-types/utils/types';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, type Observable } from 'rxjs';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { assetIdsQuery } from '../../queries/restake/assetIds';
import { rewardVaultRxQuery } from '../../queries/restake/rewardVault';

export type UseRestakeAssetIdsReturnType = {
  assetIds: string[];
  assetIds$: Observable<string[]>;
};

/**
 * Retrieves the whitelisted asset IDs for restaking.
 * The hook returns an object containing the asset IDs and an observable to refresh the asset IDs.
 */
export default function useRestakeAssetIds(): Evaluate<UseRestakeAssetIdsReturnType> {
  const { apiRx } = usePolkadotApi();

  const assetIds$ = useMemo(
    () =>
      rewardVaultRxQuery(apiRx).pipe(
        map((rewardVaults) =>
          assetIdsQuery(rewardVaults).map((id) => id.toString()),
        ),
      ),
    [apiRx],
  );

  const assetIds = useObservableState(assetIds$, []);

  return { assetIds, assetIds$ };
}
