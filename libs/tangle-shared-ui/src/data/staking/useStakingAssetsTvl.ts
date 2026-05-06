import { BN } from '@polkadot/util';
import { useMemo } from 'react';
import { StakingAssetId } from '../../types';
import useStakingDeposits from './useStakingDeposits';

const useSubstrateStakingAssetsTvl = (): Map<StakingAssetId, BN> | null => {
  const { result: deposits } = useStakingDeposits();

  const tvlMap = useMemo(() => {
    if (deposits === null) {
      return null;
    }

    const tvlMap = new Map<StakingAssetId, BN>();

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

export default useSubstrateStakingAssetsTvl;
