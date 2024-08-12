import type { Evaluate } from '@webb-tools/dapp-types/utils/types';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, type Observable } from 'rxjs';

import useRestakeRewardPoolMap from './useRestakeRewardPoolMap';

export type UseRestakeAssetIdsReturnType = {
  assetIds: string[];
  assetIds$: Observable<string[]>;
};

/**
 * Retrieves the whitelisted asset IDs for restaking.
 * The hook returns an object containing the asset IDs and an observable to refresh the asset IDs.
 */
export default function useRestakeAssetIds(): Evaluate<UseRestakeAssetIdsReturnType> {
  const { rewardPoolMap$ } = useRestakeRewardPoolMap();

  const assetIds$ = useMemo(
    () =>
      rewardPoolMap$.pipe(
        map((rewardPoolMap) => {
          const assetIds = Object.values(rewardPoolMap)
            .flat()
            .filter((assetId): assetId is string => assetId !== null);

          // Remove duplicates
          return Array.from(new Set(assetIds));
        }),
      ),
    [rewardPoolMap$],
  );

  const assetIds = useObservableState(assetIds$, []);

  return { assetIds, assetIds$ };
}
