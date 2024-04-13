import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import calculateBnPercentage from '../../utils/calculateBnPercentage';
import useCurrentEra from './useCurrentEra';

const useActualStakedPercentage = () => {
  const { data: currentEra } = useCurrentEra();

  const { data: totalIssuance } = useApiRx(
    useCallback((api) => api.query.balances.totalIssuance(), [])
  );

  const { data: totalStaked } = useApiRx(
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
