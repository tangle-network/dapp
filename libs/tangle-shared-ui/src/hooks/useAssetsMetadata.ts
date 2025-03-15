import useApiRx from './useApiRx';
import { useCallback, useMemo } from 'react';

const useAssetsMetadata = (singleOrMultipleAssetIds: string | string[]) => {
  let addresses: string[];

  if (Array.isArray(singleOrMultipleAssetIds)) {
    addresses = singleOrMultipleAssetIds;
  } else {
    addresses = [singleOrMultipleAssetIds];
  }

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

      return [addresses[index], metadataResult] as const;
    });
  }, [addresses, result]);

  return { result: new Map(assetsMetadata), ...other };
};

export default useAssetsMetadata;
