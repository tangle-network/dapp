import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useEntryMap from '../../hooks/useEntryMap';

const useEraTotalRewards = () => {
  const { result: erasValidatorRewards, ...other } = useApiRx(
    useCallback((api) => api.query.staking.erasValidatorReward.entries(), []),
  );

  const erasValidatorRewardsMap = useEntryMap(
    erasValidatorRewards,
    useCallback(
      (key) =>
        // It's fine to convert `u32` to a JavaScript number, it'll
        // always be within the safe range.
        key.args[0].toNumber(),
      [],
    ),
  );

  return { data: erasValidatorRewardsMap, ...other };
};

export default useEraTotalRewards;
