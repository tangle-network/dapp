import { map, Observable } from 'rxjs';

export function assetIdsQuery(
  rewardVaults: [vaultId: bigint, assetIds: bigint[] | null][],
) {
  const assetIds = rewardVaults.flatMap(([, assetIds]) => assetIds ?? []);

  return Array.from(new Set(assetIds));
}

export function assetIdsRxQuery(
  rewardVaults$: Observable<[vaultId: bigint, assetIds: bigint[] | null][]>,
) {
  return rewardVaults$.pipe(
    map((rewardVaults) => {
      const assetIds = rewardVaults.flatMap(([, assetIds]) => assetIds ?? []);

      return Array.from(new Set(assetIds));
    }),
  );
}
