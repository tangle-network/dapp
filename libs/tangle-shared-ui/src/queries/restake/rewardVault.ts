import type { ApiPromise, ApiRx } from '@polkadot/api';
import type { Option, StorageKey, u128, Vec } from '@polkadot/types';
import { map, of } from 'rxjs';

function toPrimitive(
  entries: [StorageKey<[u128]>, Option<Vec<u128>>][],
): [vaultId: bigint, assetIds: bigint[] | null][] {
  return entries.map(
    ([vaultId, assetIds]) =>
      [
        vaultId.args[0].toBigInt(),
        assetIds.isNone
          ? null
          : assetIds.unwrap().map((assetId) => assetId.toBigInt()),
      ] as const,
  );
}

export async function rewardVaultQuery(api: ApiPromise) {
  if (api.query.multiAssetDelegation?.rewardVaults === undefined) return [];

  const entries = await api.query.multiAssetDelegation.rewardVaults.entries();

  return toPrimitive(entries);
}

export function rewardVaultRxQuery(apiRx: ApiRx) {
  if (apiRx.query.multiAssetDelegation?.rewardVaults === undefined)
    return of([]);

  return apiRx.query.multiAssetDelegation.rewardVaults
    .entries()
    .pipe(map(toPrimitive));
}
