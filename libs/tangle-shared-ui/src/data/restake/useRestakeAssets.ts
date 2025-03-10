import { Option, StorageKey, u32, Vec } from '@polkadot/types';
import { TanglePrimitivesServicesTypesAsset } from '@polkadot/types/lookup';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { isEvmAddress } from '@tangle-network/ui-components';
import assert from 'assert';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';
import { NATIVE_ASSET_ID } from '../../constants/restaking';
import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import usePromise from '../../hooks/usePromise';
import useViemPublicClient from '../../hooks/useViemPublicClient';
import { RestakeAssetId } from '../../types';
import { TangleError, TangleErrorCode } from '../../types/error';
import { RestakeAsset, RestakeAssetMetadata } from '../../types/restake';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import createRestakeAssetId from '../../utils/createRestakeAssetId';
import fetchErc20TokenMetadata from '../../utils/fetchErc20TokenMetadata';
import useVaultsPotAccounts from '../rewards/useVaultsPotAccounts';
import useRestakeAssetBalances from './useRestakeAssetBalances';

const toPrimitiveRewardVault = (
  entries: [
    StorageKey<[u32]> | number,
    Option<Vec<TanglePrimitivesServicesTypesAsset>>,
  ][],
): [vaultId: bigint, assetIds: RestakeAssetId[] | null][] => {
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
};

const useRestakeAssets = () => {
  const nativeTokenSymbol = useNetworkStore((store) => store.nativeTokenSymbol);
  const viemPublicClient = useViemPublicClient();

  const { result: vaultPotAccounts, isLoading: isLoadingVaultsPotAccounts } =
    useVaultsPotAccounts();

  const { result: rewardVaults, isLoading: isLoadingRewardVaults } = useApiRx(
    useCallback(
      (api) => {
        if (vaultPotAccounts === null) {
          return new TangleError(TangleErrorCode.INVALID_PARAMS);
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
      return null;
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

  const { result: nativeAssetDetails, isLoading: isLoadingNativeAssetDetails } =
    useApiRx(
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

  const {
    result: nativeAssetMetadatas,
    isLoading: isLoadingNativeAssetMetadatas,
  } = useApiRx(
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

  const { result: assetVaultIds, isLoading: isLoadingAssetVaultIds } = useApiRx(
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

  const { result: evmAssetMetadatas, isLoading: isLoadingEvmAssetMetadatas } =
    usePromise(
      useCallback(async () => {
        if (evmAssetIds === null || viemPublicClient === null) {
          return null;
        }

        return await fetchErc20TokenMetadata(viemPublicClient, evmAssetIds);
      }, [evmAssetIds, viemPublicClient]),
      null,
    );

  const evmAssets = useMemo(() => {
    if (evmAssetIds === null || evmAssetMetadatas === null) {
      return null;
    }

    return evmAssetIds.flatMap((assetId) => {
      const metadata = evmAssetMetadatas.find(
        (metadata) => metadata.id === assetId,
      );

      // Skip if metadata is not found.
      if (metadata === undefined) {
        return [];
      }

      return [
        {
          assetId,
          name: metadata.name,
          decimals: metadata.decimals,
          symbol: metadata.symbol,
          vaultId: assetVaultIds?.get(assetId) ?? null,
          // TODO: Implement token price fetching.
          priceInUsd: null,
          status: 'Live',
          // TODO: Details?
        } satisfies RestakeAssetMetadata,
      ];
    });
  }, [assetVaultIds, evmAssetIds, evmAssetMetadatas]);

  const nativeAssets = useMemo<RestakeAssetMetadata[] | null>(() => {
    if (substrateAssetIds === null || nativeAssetMetadatas === null) {
      return null;
    }

    const nativeAssets = substrateAssetIds.flatMap((assetId) => {
      const details = nativeAssetDetails?.get(assetId);
      const metadata = nativeAssetMetadatas.get(assetId);

      if (metadata === undefined) {
        return [];
      }

      const vaultId = assetVaultIds?.get(assetId) ?? null;
      const name = metadata.name.toUtf8();

      const asset = {
        name: name === '' ? `Asset #${assetId}` : name,
        symbol: metadata.symbol.toUtf8(),
        decimals: metadata.decimals.toNumber(),
        assetId,
        details,
        vaultId,
        // TODO: Implement price fetching.
        priceInUsd: null,
        status: 'Live' as const,
      } satisfies RestakeAssetMetadata;

      return [asset];
    });

    // TODO: Balance should be what is locked in staking, for native restaking.
    // Insert the network's native asset to allow for native restaking.
    const nativeNetworkAsset: RestakeAssetMetadata = {
      name: nativeTokenSymbol,
      symbol: nativeTokenSymbol,
      decimals: TANGLE_TOKEN_DECIMALS,
      assetId: NATIVE_ASSET_ID,
      details: undefined,
      vaultId: null,
      status: 'Live',
      // TODO: Waiting for price fetching implementation.
      priceInUsd: null,
    };

    return [nativeNetworkAsset, ...nativeAssets];
  }, [
    nativeAssetDetails,
    nativeAssetMetadatas,
    assetVaultIds,
    nativeTokenSymbol,
    substrateAssetIds,
  ]);

  const assetMap = useMemo(() => {
    if (nativeAssets === null || evmAssets === null) {
      return null;
    }

    const map = new Map<RestakeAssetId, RestakeAssetMetadata>();

    for (const asset of nativeAssets) {
      map.set(asset.assetId, asset);
    }

    for (const asset of evmAssets) {
      assert(!map.has(asset.assetId));
      map.set(asset.assetId, asset);
    }

    return map;
  }, [evmAssets, nativeAssets]);

  const {
    balances,
    refetchErc20Balances,
    isLoading: isLoadingBalances,
  } = useRestakeAssetBalances();

  const assetsWithBalances = useMemo(() => {
    if (assetMap === null) {
      return null;
    }

    const map = new Map<RestakeAssetId, RestakeAsset>();

    for (const [assetId, metadata] of assetMap.entries()) {
      map.set(assetId, {
        id: assetId,
        metadata,
        balance: balances?.get(assetId),
      });
    }

    return map;
  }, [assetMap, balances]);

  const refetchErc20Balances_ = useCallback(async () => {
    await refetchErc20Balances();
  }, [refetchErc20Balances]);

  return {
    assets: assetsWithBalances,
    refetchErc20Balances: refetchErc20Balances_,
    isLoading:
      isLoadingBalances ||
      isLoadingNativeAssetDetails ||
      isLoadingNativeAssetMetadatas ||
      isLoadingEvmAssetMetadatas ||
      isLoadingAssetVaultIds ||
      isLoadingRewardVaults ||
      isLoadingVaultsPotAccounts,
  };
};

export default useRestakeAssets;
