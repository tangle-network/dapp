import { useMemo } from 'react';

import useActiveValidators from './useActiveValidators';
import useWaitingValidators from './useWaitingValidators';

const useAllValidators = () => {
  const activeValidators = useActiveValidators();
  const waitingValidators = useWaitingValidators();

  // TODO: Consider making this a map instead of an array.
  const allValidators = useMemo(
    () => [...(activeValidators ?? []), ...(waitingValidators ?? [])],
    [activeValidators, waitingValidators],
  );

  return allValidators;
};

export default useAllValidators;
