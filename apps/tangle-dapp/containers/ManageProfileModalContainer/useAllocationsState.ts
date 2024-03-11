import { useCallback, useEffect, useState } from 'react';

import useRestakingAllocations from '../../data/restaking/useRestakingAllocations';
import { RestakingProfileType } from './ManageProfileModalContainer';
import { RestakingAllocationMap } from './types';

const useAllocationsState = (profileType: RestakingProfileType) => {
  const { value: remoteAllocations, isLoading } =
    useRestakingAllocations(profileType);

  const [allocations, setAllocations] = useState<RestakingAllocationMap>({});

  useEffect(() => {
    if (remoteAllocations !== null) {
      setAllocations(remoteAllocations);
    }
  }, [remoteAllocations, isLoading, profileType]);

  const reset = useCallback(() => {
    setAllocations(remoteAllocations ?? {});
  }, [remoteAllocations]);

  const setAllocationsOverride = useCallback(
    (newAllocations: RestakingAllocationMap) => {
      setAllocations(newAllocations);
    },
    []
  );

  return {
    reset,
    isLoading,
    allocations,
    setAllocations: setAllocationsOverride,
    setAllocationsDispatch: setAllocations,
  };
};

export default useAllocationsState;
