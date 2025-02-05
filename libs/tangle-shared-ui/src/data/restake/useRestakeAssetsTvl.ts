import { BN } from '@polkadot/util';
import { useMemo } from 'react';
import { RestakeAssetId } from '../../types';
import useRestakeDeposits from './useRestakeDeposits';

const useRestakeAssetsTvl = (): Map<RestakeAssetId, BN> | null => {
  const { result: deposits } = useRestakeDeposits();

  const tvlMap = useMemo(() => {
    if (deposits === null) {
      return null;
    }

    const tvlMap = new Map<RestakeAssetId, BN>();

    for (const deposit of deposits) {
      const existingEntry = tvlMap.get(deposit.assetId);

      if (existingEntry === undefined) {
        tvlMap.set(deposit.assetId, deposit.amount);
      } else {
        tvlMap.set(deposit.assetId, existingEntry.add(deposit.amount));
      }
    }

    return tvlMap;
  }, [deposits]);

  return tvlMap;
};

export default useRestakeAssetsTvl;
