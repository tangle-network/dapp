import type { ApiRx } from '@polkadot/api';
import type { Option, StorageKey, u32, Vec } from '@polkadot/types';
import { TanglePrimitivesServicesTypesAsset } from '@polkadot/types/lookup';
import { map, of } from 'rxjs';
import createRestakeAssetId from '../../utils/createRestakeAssetId';
import { RestakeAssetId } from '../../types';

function toPrimitive(
  entries: [
    StorageKey<[u32]> | number,
    Option<Vec<TanglePrimitivesServicesTypesAsset>>,
  ][],
): [vaultId: bigint, assetIds: RestakeAssetId[] | null][] {
  return entries.map(([vaultId, assets]) => {
    const vaultIdBigInt =
      typeof vaultId === 'number'
        ? BigInt(vaultId)
        : vaultId.args[0].toBigInt();

    const assetIds = assets.isNone
      ? null
      : assets.unwrap().map(createRestakeAssetId);

    return [vaultIdBigInt, assetIds] as const;
  });
}

export function rewardVaultRxQuery(apiRx: ApiRx, vaultIds?: number[]) {
  if (apiRx.query.rewards?.rewardVaults === undefined) {
    return of([]);
  }

  if (Array.isArray(vaultIds) && vaultIds.length > 0) {
    return apiRx.query.rewards.rewardVaults
      .multi(vaultIds)
      .pipe(
        map((results) =>
          toPrimitive(
            results.map((result, idx) => [vaultIds[idx], result] as const),
          ),
        ),
      );
  }

  return apiRx.query.rewards.rewardVaults.entries().pipe(map(toPrimitive));
}
