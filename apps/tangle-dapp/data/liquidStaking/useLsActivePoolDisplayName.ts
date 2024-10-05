import { u8aToString } from '@polkadot/util';
import { useMemo } from 'react';

import { LsPoolDisplayName } from '../../constants/liquidStaking/types';
import useLsBondedPools from './useLsBondedPools';
import { useLsStore } from './useLsStore';

const useLsActivePoolDisplayName = (): LsPoolDisplayName | null => {
  const { lsPoolId } = useLsStore();
  const bondedPools = useLsBondedPools();

  const name = useMemo(() => {
    if (bondedPools === null || lsPoolId === null) {
      return null;
    }

    const activePool = bondedPools.find(([id]) => id === lsPoolId);

    if (activePool === undefined) {
      return null;
    }

    return `${u8aToString(activePool[1].metadata.name)}#${lsPoolId}` satisfies LsPoolDisplayName;
  }, [bondedPools, lsPoolId]);

  return name;
};

export default useLsActivePoolDisplayName;
