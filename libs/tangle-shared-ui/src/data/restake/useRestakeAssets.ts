import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';
import useVaultsPotAccounts from '../../queries/restake/rewardVaultsPotAccounts';
import useApiRx from '../../hooks/useApiRx';
import { StorageKey, u32, Vec, Option } from '@polkadot/types';
import { TanglePrimitivesServicesAsset } from '@polkadot/types/lookup';
import { RestakeAssetId } from '../../types';
import createRestakeAssetId from '../../utils/createRestakeAssetId';
import { isEvmAddress } from '@tangle-network/ui-components';
import { RestakeAssetMetadata } from '../../types/restake';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';

function toPrimitiveRewardVault(
  entries: [
    StorageKey<[u32]> | number,
    Option<Vec<TanglePrimitivesServicesAsset>>,
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

const useRestakeAssets = () => {
  const { result: vaultPotAccounts } = useVaultsPotAccounts();

  const { result: rewardVaults } = useApiRx(
    useCallback(
      (api) => {
        if (
          vaultPotAccounts === null ||
          api.query.rewards?.rewardVaultsPotAccount === undefined
        ) {
          return null;
        }

        // Retrieve all vaults that have pot accounts.
        const vaultIds = vaultPotAccounts.keys().toArray();

        if (vaultIds.length === 0) {
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
      [vaultPotAccounts],
    ),
  );

  const assetIds = useMemo(() => {
    if (rewardVaults === null) {
      return [];
    }

    return rewardVaults
      .map(([, assetIds]) => assetIds)
      .filter(
        (assetIds): assetIds is Exclude<typeof assetIds, null> =>
          assetIds !== null,
      )
      .flat();
  }, [rewardVaults]);

  const substrateAssetIds = useMemo(() => {
    if (assetIds === null) {
      return null;
    }

    return assetIds.filter((assetId) => !isEvmAddress(assetId));
  }, [assetIds]);

  const evmAssetIds = useMemo(() => {
    if (assetIds === null) {
      return null;
    }

    return assetIds.filter((assetId) => isEvmAddress(assetId));
  }, [assetIds]);

  const { result: nativeAssetDetails } = useApiRx(
    useCallback((api) => {
      return api.query.assets.asset.entries().pipe(
        map((entries) => {
          const keyValues = entries.flatMap(([key, detailsOpt]) => {
            if (detailsOpt.isNone) {
              return [];
            }

            const assetId = assertRestakeAssetId(
              key.args[0].toBigInt().toString(),
            );

            const details = detailsOpt.unwrap();

            return [[assetId, details] as const];
          });

          return new Map(keyValues);
        }),
      );
    }, []),
  );

  const { result: nativeAssetMetadatas } = useApiRx(
    useCallback((api) => {
      return api.query.assets.metadata.entries().pipe(
        map((entries) => {
          const keyValues = entries.map(([key, metadata]) => {
            const assetId = assertRestakeAssetId(
              key.args[0].toBigInt().toString(),
            );

            return [assetId, metadata] as const;
          });

          return new Map(keyValues);
        }),
      );
    }, []),
  );

  const { result: nativeAssetVaultIds } = useApiRx(
    useCallback((api) => {
      return api.query.rewards.assetLookupRewardVaults.entries().pipe(
        map((entries) => {
          const keyValues = entries.flatMap(([key, vaultIdOpt]) => {
            if (vaultIdOpt.isNone) {
              return [];
            }

            const assetId = createRestakeAssetId(key.args[0]);

            return [[assetId, vaultIdOpt.unwrap().toNumber()] as const];
          });

          return new Map(keyValues);
        }),
      );
    }, []),
  );

  const nativeAssets = useMemo<RestakeAssetMetadata[] | null>(() => {
    if (substrateAssetIds === null || nativeAssetMetadatas === null) {
      return null;
    }

    return substrateAssetIds.flatMap((assetId) => {
      const details = nativeAssetDetails?.get(assetId);
      const metadata = nativeAssetMetadatas.get(assetId);

      if (metadata === undefined) {
        return [];
      }

      const vaultId = nativeAssetVaultIds?.get(assetId) ?? null;
      const name = metadata.name.toUtf8();

      const asset = {
        name: name === '' ? `Asset ${assetId}` : name,
        symbol: metadata.symbol.toUtf8(),
        decimals: metadata.decimals.toNumber(),
        assetId,
        details,
        vaultId,
        // TODO: Implement price fetching.
        priceInUsd: null,
      } satisfies RestakeAssetMetadata;

      return [asset];
    });
  }, [
    nativeAssetDetails,
    nativeAssetMetadatas,
    nativeAssetVaultIds,
    substrateAssetIds,
  ]);

  // TODO: Evm assets too.
  return nativeAssets;
};

export default useRestakeAssets;
