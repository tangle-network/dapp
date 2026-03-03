import { isEvmAddress } from '@tangle-network/ui-components';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';
import type { StakingAssetId } from '../types';
import type { PrimitiveStakingAssetMetadata } from '../types/staking';
import useApiRx from './useApiRx';
import { useEvmAssetMetadatas } from './useEvmAssetMetadatas';

const useAssetsMetadata = (
  singleOrMultipleAssetIds: StakingAssetId | StakingAssetId[],
) => {
  const { evmAssetIds, nativeAssetIds } = useMemo(() => {
    let assets: StakingAssetId[] = [];
    if (Array.isArray(singleOrMultipleAssetIds)) {
      assets = singleOrMultipleAssetIds;
    } else {
      assets = [singleOrMultipleAssetIds];
    }

    const { evmAssetIds, nativeAssetIds } = assets.reduce(
      (acc, assetId) => {
        if (isEvmAddress(assetId)) {
          acc.evmAssetIds.push(assetId);
        } else {
          acc.nativeAssetIds.push(assetId);
        }

        return acc;
      },
      {
        evmAssetIds: new Array<EvmAddress>(),
        nativeAssetIds: new Array<StakingAssetId>(),
      },
    );

    return {
      evmAssetIds: Array.from(new Set(evmAssetIds)),
      nativeAssetIds: Array.from(new Set(nativeAssetIds)),
    };
  }, [singleOrMultipleAssetIds]);

  const { data: evmAssetMetadatas, isLoading: isLoadingEvmAssetMetadatas } =
    useEvmAssetMetadatas(evmAssetIds);

  const {
    result: nativeAssetMetadatas,
    isLoading: isLoadingNativeAssetMetadatas,
  } = useApiRx(
    useCallback(
      (api) => {
        return api.query.assets.metadata.multi(nativeAssetIds).pipe(
          map((assets) => {
            return assets.map((asset, index) => {
              if (asset.isEmpty) {
                return null;
              }

              return {
                name: asset.name.toUtf8(),
                symbol: asset.symbol.toUtf8(),
                decimals: asset.decimals.toNumber(),
                deposit: asset.deposit.toBigInt().toString(),
                isFrozen: asset.isFrozen.toHuman() ?? false,
                assetId: nativeAssetIds[index],
              };
            });
          }),
        );
      },
      [nativeAssetIds],
    ),
  );

  const assetsMetadata = useMemo(() => {
    if (!nativeAssetMetadatas && !evmAssetMetadatas) {
      return undefined;
    }

    const assetsMetadataMap = new Map<
      StakingAssetId,
      PrimitiveStakingAssetMetadata | null
    >();

    if (nativeAssetMetadatas) {
      for (const asset of nativeAssetMetadatas) {
        if (asset) {
          const { assetId, ...rest } = asset;
          assetsMetadataMap.set(assetId, rest);
        }
      }
    }

    if (evmAssetMetadatas) {
      for (const asset of evmAssetMetadatas) {
        assetsMetadataMap.set(asset.id, asset);
      }
    }

    return assetsMetadataMap;
  }, [evmAssetMetadatas, nativeAssetMetadatas]);

  return {
    result: assetsMetadata,
    isLoading: isLoadingEvmAssetMetadatas || isLoadingNativeAssetMetadatas,
  };
};

export default useAssetsMetadata;
