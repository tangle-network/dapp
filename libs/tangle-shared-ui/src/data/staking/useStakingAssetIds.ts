import { Option, StorageKey, u32, Vec } from '@polkadot/types';
import { TanglePrimitivesServicesTypesAssetU128 } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { map, of } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { StakingAssetId } from '../../types';
import { TangleError, TangleErrorCode } from '../../types/error';
import createStakingAssetId from '../../utils/createStakingAssetId';
import useVaultsPotAccounts from '../rewards/useVaultsPotAccounts';

function toPrimitive(
  entries: [
    StorageKey<[u32]> | number,
    Option<Vec<TanglePrimitivesServicesTypesAssetU128>>,
  ][],
): StakingAssetId[] {
  return entries.flatMap(([, assets]) => {
    if (assets.isNone) {
      return [];
    }

    return assets.unwrap().map(createStakingAssetId);
  });
}

const useStakingAssetIds = () => {
  const { result: vaultPotAccounts, isLoading: isLoadingVaultPotAccounts } =
    useVaultsPotAccounts();

  const { result: assetIds, isLoading: isLoadingAssetIds } = useApiRx(
    useCallback(
      (api) => {
        if (vaultPotAccounts === null) {
          return new TangleError(TangleErrorCode.INVALID_PARAMS);
        }

        const vaultIds = vaultPotAccounts.keys().toArray();

        if (api.query.rewards?.rewardVaults === undefined) {
          return of([]);
        } else if (vaultIds.length === 0) {
          return api.query.rewards.rewardVaults
            .entries()
            .pipe(map(toPrimitive));
        }

        return api.query.rewards.rewardVaults
          .multi(vaultIds)
          .pipe(
            map((results) =>
              toPrimitive(
                results.map((result, idx) => [vaultIds[idx], result] as const),
              ),
            ),
          );
      },
      [vaultPotAccounts],
    ),
  );

  return {
    assetIds,
    isLoading: isLoadingVaultPotAccounts || isLoadingAssetIds,
  };
};

export default useStakingAssetIds;
