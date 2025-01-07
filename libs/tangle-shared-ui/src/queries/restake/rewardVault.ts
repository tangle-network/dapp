import type { ApiRx } from '@polkadot/api';
import type { Option, StorageKey, u128, Vec } from '@polkadot/types';
import { TanglePrimitivesServicesAsset } from '@polkadot/types/lookup';
import { map, of } from 'rxjs';

function toPrimitive(
  entries: [StorageKey<[u128]>, Option<Vec<TanglePrimitivesServicesAsset>>][],
): [vaultId: bigint, assetIds: bigint[] | null][] {
  return entries.map(([vaultId, assets]) => {
    const vaultIdBigInt = vaultId.args[0].toBigInt();

    const assetIds = assets.isNone
      ? null
      : assets.unwrap().map((asset) => {
          switch (asset.type) {
            case 'Custom':
              return BigInt(asset.asCustom.toBigInt());
            // TODO: Add support for ERC-20 case.
            case 'Erc20':
              throw new Error('Unsupported asset type: Erc20');
            default: {
              const _exhaustive: never = asset.type;

              throw new Error(`Unhandled asset type: ${_exhaustive}`);
            }
          }
        });

    return [vaultIdBigInt, assetIds] as const;
  });
}

export function rewardVaultRxQuery(apiRx: ApiRx) {
  if (apiRx.query.multiAssetDelegation?.rewardVaults === undefined) {
    return of([]);
  }

  return apiRx.query.multiAssetDelegation.rewardVaults
    .entries()
    .pipe(map(toPrimitive));
}
