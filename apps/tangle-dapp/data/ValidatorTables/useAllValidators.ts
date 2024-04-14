import { useMemo } from 'react';

import useActiveValidators from './useActiveValidators';
import useWaitingValidators from './useWaitingValidators';

const useAllValidators = () => {
  const activeValidators = useActiveValidators();
  const waitingValidators = useWaitingValidators();

  // TODO: This overrides sorting on the UI. Need to consider sorting here.
  const allValidators = useMemo(
    () => [...(activeValidators ?? []), ...(waitingValidators ?? [])],
    [activeValidators, waitingValidators]
  );

  return allValidators;
};

export default useAllValidators;
