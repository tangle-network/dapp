import { useMemo } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

import { SwrBaseKey } from '../constants';
import { getActiveValidators, getWaitingValidators } from '../data';

const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenHidden: false,
  // 3 minute polling interval.
  refreshInterval: 3 * 60 * 1000,
  // 2 minute deduping interval.
  dedupingInterval: 2 * 60 * 1000,
};

// TODO: This needs to be optimized as it is causing significant performance pause & many requests. Instead of loading all the data at once, prefer a lazy/incremental approach such as paginated approach. Will need to adjust the consumer component of this hook to handle paginated data.
const useAllValidatorsData = () => {
  console.debug('Making useAllValidatorsData request....');
  const { data: activeValidatorsData } = useSWR(
    SwrBaseKey.ActiveValidators,
    getActiveValidators,
    swrConfig
  );

  const { data: waitingValidatorsData } = useSWR(
    SwrBaseKey.WaitingValidators,
    getWaitingValidators,
    swrConfig
  );

  const allValidators = useMemo(() => {
    if (!activeValidatorsData || !waitingValidatorsData) return [];

    return [...activeValidatorsData, ...waitingValidatorsData];
  }, [activeValidatorsData, waitingValidatorsData]);

  console.debug('useAllValidatorsData request COMPLETED!');

  return allValidators;
};

export default useAllValidatorsData;
