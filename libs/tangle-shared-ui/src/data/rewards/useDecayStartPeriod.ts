import { useCallback } from 'react';
import useApiRx from '../../hooks/useApiRx';

const useDecayStartPeriod = () => {
  return useApiRx(
    useCallback((apiRx) => {
      if (apiRx.query.rewards?.decayStartPeriod === undefined) {
        return null;
      }

      return apiRx.query.rewards.decayStartPeriod();
    }, []),
  );
};

export default useDecayStartPeriod;
