import { useMemo } from 'react';
import useSWR from 'swr';

import { getActiveValidators, getWaitingValidators } from '../data';

const useAllValidatorsData = () => {
  const { data: activeValidatorsData } = useSWR(
    [getActiveValidators.name],
    ([, ...args]) => getActiveValidators(...args)
  );

  const { data: waitingValidatorsData } = useSWR(
    [getWaitingValidators.name],
    ([, ...args]) => getWaitingValidators(...args)
  );

  const allValidators = useMemo(() => {
    if (!activeValidatorsData || !waitingValidatorsData) return [];

    return [...activeValidatorsData, ...waitingValidatorsData];
  }, [activeValidatorsData, waitingValidatorsData]);

  return allValidators;
};

export default useAllValidatorsData;
