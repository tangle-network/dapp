import useApiRx from './useApiRx';
import { useCallback, useMemo } from 'react';
import { RestakeAssetId } from '../types';
import { PrimitiveAssetMetadata } from '../types/restake';
type useAssetsMetadataProps = RestakeAssetId | RestakeAssetId[];

const useAssetsMetadata = (
  singleOrMultipleAssetIds: useAssetsMetadataProps,
) => {
  const addresses = useMemo(() => {
    if (Array.isArray(singleOrMultipleAssetIds)) {
      return Array.from(new Set(singleOrMultipleAssetIds));
    } else {
      return [singleOrMultipleAssetIds];
    }
  }, [singleOrMultipleAssetIds]) ;

  const { result, ...other } = useApiRx(
    useCallback(
      (api) => api.query.assets.metadata.multi(addresses),
      [addresses],
    ),
  );  

  const assetsMetadata = useMemo(() => {
    if (result === null) {
      return [];
    }

    return result.map((metadataResult, index) => {
      if (metadataResult.isEmpty) {
        return [addresses[index], null] as const;
      }

      return [addresses[index], metadataResult.toHuman() as PrimitiveAssetMetadata] as const;
    });
  }, [addresses, result]);

  return { result: new Map(assetsMetadata), ...other };
};

export default useAssetsMetadata;
