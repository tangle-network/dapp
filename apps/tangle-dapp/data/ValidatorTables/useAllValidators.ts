import { useMemo } from 'react';

import useActiveValidators from './useActiveValidators';
import useWaitingValidators from './useWaitingValidators';

const useAllValidators = () => {
  console.debug('useAllValidators.ts: render');
  const activeValidators = useActiveValidators();
  const waitingValidators = useWaitingValidators();

  const allValidators = useMemo(
    () => [...(activeValidators ?? []), ...(waitingValidators ?? [])],
    [activeValidators, waitingValidators]
  );

  return allValidators;
};

export default useAllValidators;
