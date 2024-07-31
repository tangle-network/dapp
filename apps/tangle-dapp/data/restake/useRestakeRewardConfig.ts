import type { Option } from '@polkadot/types';
import type { PalletMultiAssetDelegationRewardsRewardConfig } from '@polkadot/types/lookup';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, of } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import type { RewardConfig, RewardConfigForAsset } from '../../types/restake';
import hasQuery from '../../utils/hasQuery';

export default function useRestakeRewardConfig() {
  const { apiRx } = usePolkadotApi();

  const rewardConfigFromQuery$ = useMemo(
    () =>
      hasQuery(apiRx, 'multiAssetDelegation', 'rewardConfigStorage')
        ? apiRx.query.multiAssetDelegation.rewardConfigStorage()
        : of(
            apiRx.createType<
              Option<PalletMultiAssetDelegationRewardsRewardConfig>
            >('Option<Null>'),
          ),
    [apiRx],
  );

  const rewardConfig$ = useMemo(
    () =>
      rewardConfigFromQuery$.pipe(
        map((rewardConfig) => {
          if (rewardConfig.isNone) {
            return {
              configs: {},
              whitelistedBlueprintIds: [],
            } as RewardConfig;
          }

          const config = rewardConfig.unwrap();

          const configs = Array.from(config.configs.entries()).reduce(
            (configs, [assetId, rewardConfigForAsset]) => {
              const configForAsset = {
                apy: rewardConfigForAsset.apy.toBigInt(),
                cap: rewardConfigForAsset.cap.toBigInt(),
              } satisfies RewardConfigForAsset;

              return {
                ...configs,
                [assetId.toNumber()]: configForAsset,
              };
            },
            {} as RewardConfig['configs'],
          );

          const whitelistedBlueprintIds = config.whitelistedBlueprintIds.map(
            (id) => id.toNumber(),
          );

          return { configs, whitelistedBlueprintIds } satisfies RewardConfig;
        }),
      ),
    [rewardConfigFromQuery$],
  );

  const rewardConfig = useObservableState(rewardConfig$, {
    configs: {},
    whitelistedBlueprintIds: [],
  });

  return { rewardConfig, rewardConfig$ };
}
