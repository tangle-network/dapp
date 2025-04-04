import useApiRx from './useApiRx';
import { useCallback, useMemo } from 'react';
import { RestakeAssetId } from '../types';
import { PrimitiveAssetMetadata } from '../types/restake';
import { isEvmAddress } from '@tangle-network/ui-components';
import fetchErc20TokenMetadata from '../utils/fetchErc20TokenMetadata';
import useViemPublicClient from './useViemPublicClient';
import usePromise from './usePromise';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { map } from 'rxjs';

type useAssetsMetadataProps = RestakeAssetId | RestakeAssetId[];

const useAssetsMetadata = (
  singleOrMultipleAssetIds: useAssetsMetadataProps,
) => {
  const viemPublicClient = useViemPublicClient();

  const { evmAssetIds, nativeAssetIds } = useMemo(() => {
    let assets: RestakeAssetId[] = [];
    if (Array.isArray(singleOrMultipleAssetIds)) {
      assets = singleOrMultipleAssetIds;
    } else {
      assets = [singleOrMultipleAssetIds];
    }

    const { evmAssetIds, nativeAssetIds } = assets.reduce((acc, assetId) => {
      if (isEvmAddress(assetId)) {
        acc.evmAssetIds.push(assetId);
      } else {
        acc.nativeAssetIds.push(assetId);
      }

      return acc;
    }, { evmAssetIds: [] as EvmAddress[], nativeAssetIds: [] as RestakeAssetId[] });

    return { evmAssetIds: Array.from(new Set(evmAssetIds)), nativeAssetIds: Array.from(new Set(nativeAssetIds)) };
  }, [singleOrMultipleAssetIds]);


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

  const { result: nativeAssetMetadatas, isLoading: isLoadingNativeAssetMetadatas } = useApiRx(
    useCallback(
      (api) => {
        return api.query.assets.metadata.multi(nativeAssetIds)
          .pipe(
            map((assets) => {
              return assets.map((asset, index) => {
                if (asset.isEmpty) {
                  return null;
                }

                return {
                  name: asset.name.toString(),
                  symbol: asset.symbol.toString(),
                  decimals: asset.decimals.toNumber(),
                  deposit: asset.deposit.toString(),
                  isFrozen: asset.isFrozen.toHuman(),
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
    if (nativeAssetMetadatas === null || evmAssetMetadatas === null) {
      return null;
    }

    const assetsMetadataMap = new Map<RestakeAssetId, PrimitiveAssetMetadata | null>();

    for (const asset of nativeAssetMetadatas) {
      if (asset) {
        const { assetId, ...rest } = asset;
        assetsMetadataMap.set(assetId, { ...rest });
      }
    }

    for (const asset of evmAssetMetadatas) {
      assetsMetadataMap.set(asset.id, asset);
    }

    return assetsMetadataMap;
  }, [evmAssetMetadatas, nativeAssetMetadatas]);

  return { result: assetsMetadata, isLoading: isLoadingEvmAssetMetadatas || isLoadingNativeAssetMetadatas };
};

export default useAssetsMetadata;
