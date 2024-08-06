import type { Option, u128, Vec } from '@polkadot/types';
import { useObservable, useObservableState } from 'observable-hooks';
import { map, of, switchMap } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import { RewardPoolMap } from '../../types/restake';

export default function useRestakeRewardPoolMap() {
  const { apiRx } = usePolkadotApi();

  const rewardPoolMap$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([apiRx]) => {
          if (apiRx.query.multiAssetDelegation?.rewardPools === undefined) {
            return of({} as RewardPoolMap);
          }

          // TODO: Remove this on `tangle-substrate-types` v0.5.11
          return apiRx.query.multiAssetDelegation.rewardPools
            .entries<Option<Vec<u128>>>()
            .pipe(
              map((rewardPoolEntries) =>
                rewardPoolEntries.reduce(
                  (acc, [poolIdKey, optionalAssetId]) => {
                    const assetIds = optionalAssetId.isSome
                      ? optionalAssetId
                          .unwrap()
                          .map((assetId) => assetId.toString())
                      : null;

                    const poolId = poolIdKey.args[0].toString();

                    acc[poolId] = assetIds;

                    return acc;
                  },
                  {} as RewardPoolMap,
                ),
              ),
            );
        }),
      ),
    [apiRx],
  );

  const rewardPoolMap = useObservableState(rewardPoolMap$, {});

  return { rewardPoolMap, rewardPoolMap$ };
}
