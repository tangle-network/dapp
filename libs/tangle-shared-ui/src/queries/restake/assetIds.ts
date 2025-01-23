import { map, Observable } from 'rxjs';
import { RestakeAssetId } from '../../types';

export function assetIdsQuery(
  rewardVaults: [vaultId: bigint, assetIds: RestakeAssetId[] | null][],
) {
  const assetIds = rewardVaults.flatMap(([, assetIds]) => assetIds ?? []);

  return Array.from(new Set(assetIds));
}

export function assetIdsRxQuery(
  rewardVaults$: Observable<
    [vaultId: bigint, assetIds: RestakeAssetId[] | null][]
  >,
) {
  return rewardVaults$.pipe(
    map((rewardVaults) => {
      const assetIds = rewardVaults.flatMap(([, assetIds]) => assetIds ?? []);

      return Array.from(new Set(assetIds));
    }),
  );
}
