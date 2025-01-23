import type { ApiRx } from '@polkadot/api';
import type { Option, StorageKey, u32, Vec } from '@polkadot/types';
import { TanglePrimitivesServicesAsset } from '@polkadot/types/lookup';
import { map, of } from 'rxjs';
import createRestakeAssetId, {
  RestakeAssetId,
} from '../../utils/createRestakeAssetId';

function toPrimitive(
  entries: [StorageKey<[u32]>, Option<Vec<TanglePrimitivesServicesAsset>>][],
): [vaultId: bigint, assetIds: RestakeAssetId[] | null][] {
  return entries.map(([vaultId, assets]) => {
    const vaultIdBigInt = vaultId.args[0].toBigInt();

    const assetIds = assets.isNone
      ? null
      : assets.unwrap().map(createRestakeAssetId);

    return [vaultIdBigInt, assetIds] as const;
  });
}

export function rewardVaultRxQuery(apiRx: ApiRx) {
  if (apiRx.query.rewards?.rewardVaults === undefined) {
    return of([]);
  }

  return apiRx.query.rewards.rewardVaults.entries().pipe(map(toPrimitive));
}
