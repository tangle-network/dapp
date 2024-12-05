import { useMemo } from 'react';

import useLsPools from './useLsPools';
import { useLsStore } from './useLsStore';

const useLsActivePool = () => {
  const { lsPoolId } = useLsStore();
  const lsPools = useLsPools();

  const activePool = useMemo(() => {
    if (lsPoolId === null || !(lsPools instanceof Map)) {
      return null;
    }

    return lsPools.get(lsPoolId) ?? null;
  }, [lsPoolId, lsPools]);

  return activePool;
};

export default useLsActivePool;
