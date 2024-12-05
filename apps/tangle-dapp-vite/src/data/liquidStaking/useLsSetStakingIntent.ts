import { useCallback } from 'react';

import { useLsStore } from './useLsStore';

const useLsSetStakingIntent = () => {
  const { setIsStaking, setLsPoolId } = useLsStore();

  // TODO: Need to also switch protocol to the selected pool's protocol.
  const setStakingIntent = useCallback(
    (poolId: number, isStaking: boolean) => {
      setIsStaking(isStaking);
      setLsPoolId(poolId);
    },
    [setIsStaking, setLsPoolId],
  );

  return setStakingIntent;
};

export default useLsSetStakingIntent;
