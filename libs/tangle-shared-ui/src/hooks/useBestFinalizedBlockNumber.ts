import { useCallback } from 'react';
import useApiRx from './useApiRx';

const useBestFinalizedBlockNumber = () => {
  return useApiRx(
    useCallback((apiRx) => {
      if (apiRx.derive.chain?.bestNumberFinalized === undefined) {
        return null;
      }

      return apiRx.derive.chain.bestNumberFinalized();
    }, []),
  );
};

export default useBestFinalizedBlockNumber;
