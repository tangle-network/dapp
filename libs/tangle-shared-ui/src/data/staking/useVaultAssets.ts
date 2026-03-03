import type { Option, StorageKey, u32, Vec } from '@polkadot/types';
import type { TanglePrimitivesServicesTypesAssetU128 } from '@polkadot/types/lookup';
import { useMemorizedValue } from '@tangle-network/ui-components/hooks/useMemorizedValue';
import { useCallback } from 'react';
import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import type { StakingAssetId } from '../../types';
import createStakingAssetId from '../../utils/createStakingAssetId';

const toPrimitiveRewardVault = (
  entries: [
    StorageKey<[u32]> | number,
    Option<Vec<TanglePrimitivesServicesTypesAssetU128>>,
  ][],
): Map<number, Set<StakingAssetId>> => {
  return entries.reduce((vaultAssetMap, [vaultId, assets]) => {
    if (assets.isNone) {
      return vaultAssetMap;
    }

    const vaultIdNumber =
      typeof vaultId === 'number' ? vaultId : vaultId.args[0].toNumber();

    const assetIdsSet =
      vaultAssetMap.get(vaultIdNumber) ?? new Set<StakingAssetId>();

    assets.unwrap().forEach((asset) => {
      assetIdsSet.add(createStakingAssetId(asset));
    });

    vaultAssetMap.set(vaultIdNumber, assetIdsSet);

    return vaultAssetMap;
  }, new Map<number, Set<StakingAssetId>>());
};

export const useVaultAssets = (vaultIdsArg?: number[] | null) => {
  const vaultIds = useMemorizedValue(vaultIdsArg);

  return useApiRx(
    useCallback(
      (api) => {
        if (!Array.isArray(vaultIds) || vaultIds.length === 0) {
          return api.query.rewards.rewardVaults
            .entries()
            .pipe(map(toPrimitiveRewardVault));
        }

        return api.query.rewards.rewardVaults
          .multi(vaultIds)
          .pipe(
            map((results) =>
              toPrimitiveRewardVault(
                results.map((result, idx) => [vaultIds[idx], result] as const),
              ),
            ),
          );
      },
      [vaultIds],
    ),
  );
};
