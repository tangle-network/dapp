import type { Evaluate } from '@webb-tools/dapp-types/utils/types';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, type Observable } from 'rxjs';

import useRestakeRewardVaultMap from './useRestakeRewardVaultMap';

export type UseRestakeAssetIdsReturnType = {
  assetIds: string[];
  assetIds$: Observable<string[]>;
};

/**
 * Retrieves the whitelisted asset IDs for restaking.
 * The hook returns an object containing the asset IDs and an observable to refresh the asset IDs.
 */
export default function useRestakeAssetIds(): Evaluate<UseRestakeAssetIdsReturnType> {
  const { rewardVaultMap$ } = useRestakeRewardVaultMap();

  const assetIds$ = useMemo(
    () =>
      rewardVaultMap$.pipe(
        map((rewardVaultMap) => {
          const assetIds = Object.values(rewardVaultMap)
            .flat()
            .filter((assetId): assetId is string => assetId !== null);

          // Remove duplicates
          return Array.from(new Set(assetIds));
        }),
      ),
    [rewardVaultMap$],
  );

  const assetIds = useObservableState(assetIds$, []);

  return { assetIds, assetIds$ };
}
