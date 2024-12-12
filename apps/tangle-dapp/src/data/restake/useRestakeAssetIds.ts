import type { Evaluate } from '@webb-tools/dapp-types/utils/types';
import usePolkadotApi from '@webb-tools/tangle-shared-ui/hooks/usePolkadotApi';
import { assetIdsQuery } from '@webb-tools/tangle-shared-ui/queries/restake/assetIds';
import { rewardVaultRxQuery } from '@webb-tools/tangle-shared-ui/queries/restake/rewardVault';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, type Observable } from 'rxjs';

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
