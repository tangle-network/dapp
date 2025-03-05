import { Option, StorageKey, u32, Vec } from '@polkadot/types';
import { TanglePrimitivesServicesTypesAsset } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { map, of } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { RestakeAssetId } from '../../types';
import createRestakeAssetId from '../../utils/createRestakeAssetId';
import useVaultsPotAccounts from '../rewards/useVaultsPotAccounts';

function toPrimitive(
  entries: [
    StorageKey<[u32]> | number,
    Option<Vec<TanglePrimitivesServicesTypesAsset>>,
  ][],
): RestakeAssetId[] {
  return entries.flatMap(([, assets]) => {
    if (assets.isNone) {
      return [];
    }

    return assets.unwrap().map(createRestakeAssetId);
  });
}

const useRestakeAssetIds = (): RestakeAssetId[] | null => {
  const { result: vaultPotAccounts } = useVaultsPotAccounts();

  const { result: assetIds } = useApiRx(
    useCallback(
      (api) => {
        if (vaultPotAccounts === null) {
          return null;
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

  return assetIds;
};

export default useRestakeAssetIds;
