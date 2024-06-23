import type { Option } from '@polkadot/types';
import type { PalletMultiAssetDelegationRewardsRewardConfig } from '@polkadot/types/lookup';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, of } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import type { RewardConfig, RewardConfigForAsset } from '../../types/restake';
import hasQuery from '../../utils/hasQuery';

const EMPTY_REWARD_CONFIG = {
  configs: {},
  whitelistedBlueprintIds: [],
} as RewardConfig;

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
            return EMPTY_REWARD_CONFIG;
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

  const rewardConfig = useObservableState(rewardConfig$, EMPTY_REWARD_CONFIG);

  return { rewardConfig, rewardConfig$ };
}
