import useApiRx from './useApiRx';
import { useCallback, useMemo } from 'react';
import { catchError, map, of } from 'rxjs';
import useAssetsMetadata from './useAssetsMetadata';
import assertRestakeAssetId from '../utils/assertRestakeAssetId';
import { RestakeAssetId } from '../types';
import { RestakeAsset } from '../types/restake';
import { NATIVE_ASSET_ID } from '../constants/restaking';
import useNetworkStore from '../context/useNetworkStore';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

const useAssets = () => {
  const { nativeTokenSymbol } = useNetworkStore();

  const { result: assets, isLoading: isLoadingAssets } = useApiRx(
    useCallback((api) => {
      return api.query.assets.asset.entries().pipe(
        map((entries) => {
          return entries.map(([assetId, assetDetail]) => {
            if (assetDetail.isSome) {
              return {
                id: assertRestakeAssetId(assetId.args[0].toString()),
                accounts: assetDetail.unwrap().accounts.toString(),
                admin: assetDetail.unwrap().admin.toString(),
                approvals: assetDetail.unwrap().approvals.toString(),
                deposit: assetDetail.unwrap().deposit.toString(),
                freezer: assetDetail.unwrap().freezer.toString(),
                isSufficient: assetDetail.unwrap().isSufficient.toString(),
                issuer: assetDetail.unwrap().issuer.toString(),
                minBalance: assetDetail.unwrap().minBalance.toNumber(),
                owner: assetDetail.unwrap().owner.toString(),
                status: assetDetail.unwrap().status.toString(),
                sufficients: assetDetail.unwrap().sufficients.toNumber(),
                supply: assetDetail.unwrap().supply.toNumber(),
              };
            }
            return undefined;
          });
        }),
        catchError((error) => {
          console.error(error);
          return of([]);
        }),
      );
    }, []),
  );

  const assetIds = useMemo(() => {
    if (!assets) {
      return [];
    }

    const ids: RestakeAssetId[] = [];

    for (const asset of assets) {
      if (asset !== undefined) {
        ids.push(asset.id);
      }
    }

    return ids;
  }, [assets]);

  const { result: assetsMetadata, isLoading: isLoadingAssetsMetadata } =
    useAssetsMetadata(assetIds);

  const assetsWithMetadata = useMemo(() => {
    const assetsMetadataMap = new Map<
      RestakeAssetId,
      RestakeAsset
    >();

    assetIds?.forEach((assetId) => {
      if (assetId) {
        const assetMetadata = assetsMetadata?.get(assetId);
        assetsMetadataMap.set(assetId, {
          id: assetId,
          metadata: {
            name: assetMetadata?.name ?? '',
            symbol: assetMetadata?.symbol ?? '',
            decimals: assetMetadata?.decimals ?? 0,
            deposit: assetMetadata?.deposit ?? '',
            isFrozen: assetMetadata?.isFrozen ?? false,
            assetId: assetId,
            // @dev get all assets, so this is not exit
            vaultId: null,
            // TODO: get price in usd
            priceInUsd: null,
          },
        });
      }
    });

    assetsMetadataMap.set(NATIVE_ASSET_ID, {
        id: NATIVE_ASSET_ID,
        metadata: {
          name: nativeTokenSymbol,
          symbol: nativeTokenSymbol,
          decimals: TANGLE_TOKEN_DECIMALS,
          assetId: NATIVE_ASSET_ID,
          isFrozen: false,
          vaultId: null,
          priceInUsd: null,
        }
    } satisfies RestakeAsset)

    return assetsMetadataMap;
  }, [assetsMetadata, assetIds, nativeTokenSymbol]);

  return {
    result: assetsWithMetadata,
    isLoading: isLoadingAssets || isLoadingAssetsMetadata,
  };
};

export default useAssets;
