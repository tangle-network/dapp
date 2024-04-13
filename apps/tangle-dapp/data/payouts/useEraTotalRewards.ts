import { useCallback } from 'react';

import useEntryMap from '../../hooks/useEntryMap';
import useApiRx from '../../hooks/useApiRx';

const useEraTotalRewards = () => {
  const { data: erasValidatorRewards, ...other } = useApiRx(
    useCallback((api) => api.query.staking.erasValidatorReward.entries(), [])
  );

  const erasValidatorRewardsMap = useEntryMap(erasValidatorRewards, (key) =>
    // It's fine to convert `u32` to a JavaScript number, it'll
    // always be within the safe range.
    key.args[0].toNumber()
  );

  return { data: erasValidatorRewardsMap, ...other };
};

export default useEraTotalRewards;
