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

          return apiRx.query.multiAssetDelegation.rewardPools.entries().pipe(
            map((rewardPoolEntries) =>
              rewardPoolEntries.reduce((acc, [poolIdKey, optionalAssetId]) => {
                const assetIds = optionalAssetId.isSome
                  ? optionalAssetId
                      .unwrap()
                      .map((assetId) => assetId.toString())
                  : null;

                const poolId = poolIdKey.args[0].toString();

                acc[poolId] = assetIds;

                return acc;
              }, {} as RewardPoolMap),
            ),
          );
        }),
      ),
    [apiRx],
  );

  const rewardPoolMap = useObservableState(rewardPoolMap$, {});

  return { rewardPoolMap, rewardPoolMap$ };
}
