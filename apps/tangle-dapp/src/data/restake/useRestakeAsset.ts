import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import { useMemo } from 'react';

const useRestakeAsset = (id: RestakeAssetId | null | undefined) => {
  const { assets } = useRestakeAssets();

  const asset = useMemo<RestakeAsset | null>(() => {
    if (id === null || id === undefined || assets === null) {
      return null;
    }

    return assets.get(id) ?? null;
  }, [assets, id]);

  return asset;
};

export default useRestakeAsset;
