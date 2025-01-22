import { BN } from '@polkadot/util';
import { useMemo } from 'react';
import { RestakeAssetId } from '../../types';
import useRestakeDelegations from './useRestakeDelegations';

const useRestakeAssetsTvl = (): Map<RestakeAssetId, BN> | null => {
  const delegations = useRestakeDelegations();

  const tvlMap = useMemo(() => {
    if (delegations === null) {
      return null;
    }

    const tvlMap = new Map<RestakeAssetId, BN>();

    for (const delegation of delegations) {
      const existingEntry = tvlMap.get(delegation.assetId);

      if (existingEntry === undefined) {
        tvlMap.set(delegation.assetId, delegation.amount);
      } else {
        tvlMap.set(delegation.assetId, existingEntry.add(delegation.amount));
      }
    }

    return tvlMap;
  }, [delegations]);

  return tvlMap;
};

export default useRestakeAssetsTvl;
