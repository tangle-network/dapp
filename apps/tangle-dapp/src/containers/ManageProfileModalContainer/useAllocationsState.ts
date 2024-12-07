import noop from 'lodash/noop';
import { useCallback, useState } from 'react';

import { RestakingProfileType } from '../../types';
import { RestakingAllocationMap } from './types';

const useAllocationsState = (_: RestakingProfileType) => {
  const [allocations, setAllocations] = useState<RestakingAllocationMap>({});

  const setAllocationsOverride = useCallback(
    (newAllocations: RestakingAllocationMap) => {
      setAllocations(newAllocations);
    },
    [],
  );

  return {
    reset: noop,
    isLoading: false,
    allocations,
    setAllocations: setAllocationsOverride,
    setAllocationsDispatch: setAllocations,
  };
};

export default useAllocationsState;
