import { useCallback, useEffect, useState } from 'react';

import useRestakingAllocations from '../../data/restaking/useRestakingAllocations';
import { RestakingProfileType } from './ManageProfileModalContainer';
import { RestakingAllocationMap } from './types';

const useAllocationsState = (profileType: RestakingProfileType) => {
  const { value: substrateAllocations, isLoading } =
    useRestakingAllocations(profileType);

  const [allocations, setAllocations] = useState<RestakingAllocationMap>({});

  useEffect(() => {
    if (substrateAllocations !== null) {
      setAllocations(substrateAllocations);
    }
  }, [substrateAllocations, isLoading, profileType]);

  const reset = useCallback(() => {
    setAllocations(substrateAllocations ?? {});
  }, [substrateAllocations]);

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
