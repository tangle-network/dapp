import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import { useCallback, useMemo } from 'react';

import { LsPoolUnstakeRequest } from '../../constants/liquidStaking/types';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import useCurrentEra from '../staking/useCurrentEra';
import useLsPools from './useLsPools';
import { useLsStore } from './useLsStore';

const useLsUnbonding = () => {
  const pools = useLsPools();
  const { result: currentEra } = useCurrentEra();
  const { lsProtocolId } = useLsStore();
  const activeSubstrateAddress = useSubstrateAddress();

  const lsProtocol = getLsProtocolDef(lsProtocolId);

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
      .map(([era, points]) => {
        const erasLeftToUnlock = era.toNumber() - currentEra;

        // TODO: Awaiting bug fix on Tangle.
        const poolId = unbonding.poolId.toNumber();

        return {
          unlockEra: era.toNumber(),
          erasLeftToUnlock:
            erasLeftToUnlock <= 0 ? undefined : erasLeftToUnlock,
          // TODO: Points is different than amount.
          amount: points.toBn(),
          token: lsProtocol.token,
          decimals: lsProtocol.decimals,
          poolId,
          poolName: pools.get(poolId)?.name,
          isReadyToWithdraw: erasLeftToUnlock <= 0,
        } satisfies LsPoolUnstakeRequest;
      })
      .toArray();
  }, [currentEra, lsProtocol.decimals, lsProtocol.token, pools, unbondingOpt]);

  return unstakeRequests;
};

export default useLsUnbonding;
