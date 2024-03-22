import { useMemo } from 'react';

import useActiveValidators from './useActiveValidators';
import useWaitingValidators from './useWaitingValidators';

// TODO: This needs to be optimized as it is causing significant performance pause & many requests. Instead of loading all the data at once, prefer a lazy/incremental approach such as paginated approach. Will need to adjust the consumer component of this hook to handle paginated data.
const useAllValidators = () => {
  const activeValidators = useActiveValidators();
  const waitingValidators = useWaitingValidators();

  const allValidators = useMemo(
    () => [...(activeValidators ?? []), ...(waitingValidators ?? [])],
    [activeValidators, waitingValidators]
  );

  return allValidators;
};

export default useAllValidators;
