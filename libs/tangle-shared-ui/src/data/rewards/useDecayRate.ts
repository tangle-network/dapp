import { useCallback } from 'react';
import useApiRx from '../../hooks/useApiRx';

const useDecayRate = () => {
  return useApiRx(
    useCallback((apiRx) => {
      if (apiRx.query.rewards?.decayRate === undefined) {
        return null;
      }

      return apiRx.query.rewards.decayRate();
    }, []),
  );
};

export default useDecayRate;
