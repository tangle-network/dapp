import { BN_ZERO } from '@polkadot/util';
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

    const asset = assets.get(id);

    if (asset === undefined) {
      return null;
    }

    return {
      id,
      name: asset.metadata.name,
      symbol: asset.metadata.symbol,
      decimals: asset.metadata.decimals,
      balance: asset.balance ?? BN_ZERO,
    } satisfies RestakeAsset;
  }, [assets, id]);

  return asset;
};

export default useRestakeAsset;
