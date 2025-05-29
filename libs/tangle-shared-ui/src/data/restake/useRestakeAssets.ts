import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { isEvmAddress } from '@tangle-network/ui-components';
import { BN } from '@polkadot/util';
import assert from 'assert';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';
import { NATIVE_ASSET_ID } from '../../constants/restaking';
import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import { useEvmAssetMetadatas } from '../../hooks/useEvmAssetMetadatas';
import { RestakeAssetId } from '../../types';
import { RestakeAsset, RestakeAssetMetadata } from '../../types/restake';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import createRestakeAssetId from '../../utils/createRestakeAssetId';
import useVaultsPotAccounts from '../rewards/useVaultsPotAccounts';
import useRestakeAssetBalances from './useRestakeAssetBalances';
import { useVaultAssets } from './useVaultAssets';
import useBalances from '../../hooks/useBalances';

const useRestakeAssets = () => {
  const nativeTokenSymbol = useNetworkStore((store) => store.nativeTokenSymbol);
  const { transferable: nativeBalance } = useBalances();

  const { result: vaultPotAccounts, isLoading: isLoadingVaultsPotAccounts } =
    useVaultsPotAccounts();

  const { result: rewardVaults, isLoading: isLoadingRewardVaults } =
    useVaultAssets(
      useMemo(() => vaultPotAccounts?.keys().toArray(), [vaultPotAccounts]),
    );

  const assetIds = useMemo(() => {
    if (rewardVaults === null) {
      return null;
    }

    const assetIdsSet = new Set<RestakeAssetId>();

    rewardVaults.forEach((vaultAssetsSet) => {
      vaultAssetsSet.forEach((assetId) => {
        assetIdsSet.add(assetId);
      });
    });

    return Array.from(assetIdsSet);
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

  const { data: evmAssetMetadatas, isLoading: isLoadingEvmAssetMetadatas } =
    useEvmAssetMetadatas(evmAssetIds);

  const evmAssets = useMemo(() => {
    if (evmAssetIds === null || evmAssetMetadatas === undefined) {
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
    if (nativeAssets === null && evmAssets === null) {
      return null;
    }

    const map = new Map<RestakeAssetId, RestakeAssetMetadata>();

    if (nativeAssets !== null) {
      for (const asset of nativeAssets) {
        map.set(asset.assetId, asset);
      }
    }

    if (evmAssets !== null) {
      for (const asset of evmAssets) {
        assert(!map.has(asset.assetId));
        map.set(asset.assetId, asset);
      }
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
      if (assetId === NATIVE_ASSET_ID) continue;

      map.set(assetId, {
        id: assetId,
        metadata,
        balance: balances?.get(assetId),
      });
    }

    if (nativeTokenSymbol) {
      map.set(NATIVE_ASSET_ID, {
        id: NATIVE_ASSET_ID,
        metadata: {
          assetId: NATIVE_ASSET_ID,
          name: nativeTokenSymbol,
          symbol: nativeTokenSymbol,
          decimals: TANGLE_TOKEN_DECIMALS,
          isFrozen: false,
          vaultId: null,
          priceInUsd: null, // TODO: Get actual price
          status: 'Live',
        },
        balance: nativeBalance || new BN(0),
      });
    }

    return map;
  }, [assetMap, balances, nativeTokenSymbol, nativeBalance]);

  const refetchErc20Balances_ = useCallback(async () => {
    await refetchErc20Balances();
  }, [refetchErc20Balances]);

  return {
    assets: assetsWithBalances,
    refetchErc20Balances: refetchErc20Balances_,
    isLoading:
      isLoadingNativeAssetDetails ||
      isLoadingNativeAssetMetadatas ||
      isLoadingAssetVaultIds ||
      isLoadingRewardVaults ||
      isLoadingVaultsPotAccounts ||
      isLoadingEvmAssetMetadatas,
    isLoadingBalances,
  };
};

export default useRestakeAssets;
