import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';

const useEraTotalRewards2 = () => {
  const { result: erasValidatorRewards, ...other } = useApiRx(
    useCallback((api) => api.query.staking.erasValidatorReward.entries(), []),
  );

  const keyValuePairs = useMemo(() => {
    if (erasValidatorRewards === null) {
      return null;
    }

    return erasValidatorRewards.flatMap(([key, rewardOpt]) => {
      // Ignore empty values.
      if (rewardOpt.isNone) {
        return [];
      }

      return [[key.args[0].toNumber(), rewardOpt.unwrap().toBn()] as const];
    });
  }, [erasValidatorRewards]);

  const map = useMemo(() => {
    if (keyValuePairs === null) {
      return null;
    }

    return new Map(keyValuePairs);
  }, [keyValuePairs]);

  return { data: map, ...other };
};

export default useEraTotalRewards2;
