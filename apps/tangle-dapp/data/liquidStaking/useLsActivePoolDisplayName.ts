import { u8aToString } from '@polkadot/util';
import { useMemo } from 'react';

import { LsPoolDisplayName } from '../../constants/liquidStaking/types';
import useLsBondedPools from './useLsBondedPools';
import { useLsStore } from './useLsStore';

type ActivePoolDisplayNameReturn = {
  name: string | null;
  id: number | null;
  displayName: string | null;
};

const useLsActivePoolDisplayName = (): ActivePoolDisplayNameReturn => {
  const { lsPoolId } = useLsStore();
  const bondedPools = useLsBondedPools();

  const activePool = useMemo(() => {
    if (bondedPools === null || lsPoolId === null) {
      return null;
    }

    const activePool = bondedPools.find(([id]) => id === lsPoolId);

    return activePool ?? null;
  }, [bondedPools, lsPoolId]);

  const name = useMemo(() => {
    if (activePool === null) {
      return null;
    }

    return u8aToString(activePool[1].metadata.name);
  }, [activePool]);

  const displayName = useMemo<LsPoolDisplayName | null>(() => {
    if (activePool === null || lsPoolId === null) {
      return null;
    }

    return `${name}#${lsPoolId}` satisfies LsPoolDisplayName;
  }, [activePool, lsPoolId, name]);

  return { name, id: lsPoolId, displayName };
};

export default useLsActivePoolDisplayName;
