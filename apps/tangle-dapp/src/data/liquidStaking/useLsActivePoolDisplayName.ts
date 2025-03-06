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

    const nameOpt = activePool[1].metadata.name;

    return nameOpt.isNone ? null : nameOpt.unwrap().toUtf8();
  }, [activePool]);

  const displayName = useMemo<LsPoolDisplayName | null>(() => {
    if (activePool === null || lsPoolId === null) {
      return null;
    }

    return `${name ?? 'Pool'} #${lsPoolId}` satisfies LsPoolDisplayName;
  }, [activePool, lsPoolId, name]);

  return { name, id: lsPoolId, displayName };
};

export default useLsActivePoolDisplayName;
