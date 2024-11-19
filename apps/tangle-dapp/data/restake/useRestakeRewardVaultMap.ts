import { rewardVaultRxQuery } from '@webb-tools/tangle-shared-ui/queries/restake/rewardVault';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import { RewardVaultMap } from '../../types/restake';

export default function useRestakeRewardVaultMap() {
  const { apiRx } = usePolkadotApi();

  const rewardVaultMap$ = useMemo(
    () =>
      rewardVaultRxQuery(apiRx).pipe(
        map((entries) => {
          return entries.reduce((acc, [vaultId, assetIds]) => {
            if (assetIds === null) {
              acc[vaultId.toString()] = assetIds;
            } else {
              acc[vaultId.toString()] = assetIds.map((assetId) =>
                assetId.toString(),
              );
            }

            return acc;
          }, {} as RewardVaultMap);
        }),
      ),
    [apiRx],
  );

  const rewardVaultMap = useObservableState(rewardVaultMap$, {});

  return { rewardVaultMap, rewardVaultMap$ };
}
