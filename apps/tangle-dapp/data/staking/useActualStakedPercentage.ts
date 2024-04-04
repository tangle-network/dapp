import { useCallback, useMemo } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import calculateBnPercentage from '../../utils/calculateBnPercentage';
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

    return calculateBnPercentage(totalStaked, totalIssuance);
  }, [totalIssuance, totalStaked]);
};

export default useActualStakedPercentage;
