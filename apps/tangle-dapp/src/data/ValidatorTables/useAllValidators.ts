import { useMemo } from 'react';

import useActiveValidators from './useActiveValidators';
import useWaitingValidators from './useWaitingValidators';
import filterUnique from '../../utils/filterUnique';

const useAllValidators = () => {
  const { validators: activeValidators, isLoading: isLoadingActiveValidators } =
    useActiveValidators();

  const {
    validators: waitingValidators,
    isLoading: isLoadingWaitingValidators,
  } = useWaitingValidators();

  // TODO: Consider making this a map instead of an array.
  const allValidators = useMemo(
    () =>
      [...(activeValidators ?? []), ...(waitingValidators ?? [])].filter(
        filterUnique((validator) => validator.address),
      ),
    [activeValidators, waitingValidators],
  );

  return {
    validators: allValidators,
    isLoading: isLoadingActiveValidators || isLoadingWaitingValidators,
  };
};

export default useAllValidators;
