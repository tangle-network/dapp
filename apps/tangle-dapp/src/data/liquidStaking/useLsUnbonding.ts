import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import assert from 'assert';
import { useCallback, useMemo } from 'react';

import { LsPoolUnstakeRequest } from '../../constants/liquidStaking/types';
import useCurrentEra from '../staking/useCurrentEra';
import useLsPools from './useLsPools';

const useLsUnbonding = () => {
  const pools = useLsPools();
  const { result: currentEra } = useCurrentEra();
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: unbondingOpt } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.lst.unbondingMembers(activeSubstrateAddress);
      },
      [activeSubstrateAddress],
    ),
  );

  const unstakeRequests = useMemo<LsPoolUnstakeRequest[] | null>(() => {
    if (
      unbondingOpt === null ||
      currentEra === null ||
      !(pools instanceof Map)
    ) {
      return null;
    } else if (unbondingOpt.isNone) {
      return [];
    }

    const unbonding = unbondingOpt.unwrap();

    return unbonding.unbondingEras
      .entries()
      .map(([era, [rawPoolId, points]]) => {
        const erasLeftToUnlock = era.toNumber() - currentEra;
        const poolId = rawPoolId.toNumber();
        const pool = pools.get(poolId);

        assert(pool !== undefined);

        return {
          unlockEra: era.toNumber(),
          erasLeftToUnlock:
            erasLeftToUnlock <= 0 ? undefined : erasLeftToUnlock,
          // TODO: Points is different than amount.
          amount: points.toBn(),
          poolId,
          poolName: pool.name,
          isReadyToWithdraw: erasLeftToUnlock <= 0,
          poolIconUrl: pool.iconUrl,
        } satisfies LsPoolUnstakeRequest;
      })
      .toArray();
  }, [currentEra, pools, unbondingOpt]);

  return unstakeRequests;
};

export default useLsUnbonding;
