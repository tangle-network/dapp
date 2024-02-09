import { useMemo } from 'react';
import useSWR from 'swr';

import { getActiveValidators, getWaitingValidators } from '../data';

// TODO: This needs to be optimized as it is causing significant performance pause & many requests. Instead of loading all the data at once, prefer a lazy/incremental approach such as paginated approach. Will need to adjust the consumer component of this hook to handle paginated data.
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
