import { useCallback, useMemo } from 'react';

import { LsPoolUnstakeRequest } from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import { useLsStore } from './useLsStore';

const useLsUnbonding = () => {
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
    if (unbondingOpt === null) {
      return null;
    } else if (unbondingOpt.isNone) {
      return [];
    }

    const unbonding = unbondingOpt.unwrap();

    return unbonding.unbondingEras
      .entries()
      .map(([era, points]) => {
        return {
          unbondingEra: era.toNumber(),
          // TODO: Points is different than amount.
          amount: points.toBn(),
          token: lsProtocol.token,
          decimals: lsProtocol.decimals,
          // TODO: Awaiting bug fix on Tangle.
          poolId: 1,
          // TODO: Determine pool name.
          poolName: undefined,
        } satisfies LsPoolUnstakeRequest;
      })
      .toArray();
  }, [lsProtocol.decimals, lsProtocol.token, unbondingOpt]);

  return unstakeRequests;
};

export default useLsUnbonding;
