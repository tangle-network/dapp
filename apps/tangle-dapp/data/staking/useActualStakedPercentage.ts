import { BN_MILLION } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useCurrentEra from './useCurrentEra';

const useActualStakedPercentage = () => {
  const { data: currentEra } = useCurrentEra();

  const { data: totalIssuance } = usePolkadotApiRx(
    useCallback((api) => api.query.balances.totalIssuance(), [])
  );

  const { data: totalStaked } = usePolkadotApiRx(
    useCallback(
      (api) => {
        if (currentEra === null) {
          return null;
        }

        return api.query.staking.erasTotalStake(currentEra);
      },
      [currentEra]
    )
  );

  return useMemo(() => {
    if (totalStaked === null || totalIssuance === null) {
      return null;
    }

    const stakedFraction =
      totalStaked.isZero() || totalIssuance.isZero()
        ? 0
        : totalStaked.mul(BN_MILLION).div(totalIssuance).toNumber() /
          BN_MILLION.toNumber();

    return (stakedFraction * 100).toFixed(1);
  }, [totalIssuance, totalStaked]);
};

export default useActualStakedPercentage;