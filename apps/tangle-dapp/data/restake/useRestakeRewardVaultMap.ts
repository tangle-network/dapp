import { useObservable, useObservableState } from 'observable-hooks';
import { map, of, switchMap } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import { RewardVaultMap } from '../../types/restake';

export default function useRestakeRewardVaultMap() {
  const { apiRx } = usePolkadotApi();

  const rewardVaultMap$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([apiRx]) => {
          if (apiRx.query.multiAssetDelegation?.rewardVaults === undefined) {
            return of({} as RewardVaultMap);
          }

          return apiRx.query.multiAssetDelegation.rewardVaults.entries().pipe(
            map((rewardVaultEntries) =>
              rewardVaultEntries.reduce(
                (acc, [vaultIdKey, optionalAssetId]) => {
                  const assetIds = optionalAssetId.isSome
                    ? optionalAssetId
                        .unwrap()
                        .map((assetId) => assetId.toString())
                    : null;

                  const vaultId = vaultIdKey.args[0].toString();

                  acc[vaultId] = assetIds;

                  return acc;
                },
                {} as RewardVaultMap,
              ),
            ),
          );
        }),
      ),
    [apiRx],
  );

  const rewardVaultMap = useObservableState(rewardVaultMap$, {});

  return { rewardVaultMap, rewardVaultMap$ };
}
