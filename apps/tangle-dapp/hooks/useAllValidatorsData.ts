import { useCallback, useMemo } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

import { SwrBaseKey } from '../constants';
import useRpcEndpointStore from '../context/useRpcEndpointStore';
import { getActiveValidators, getWaitingValidators } from '../data';

const swrConfig: SWRConfiguration = {
  // 1 minute deduping interval.
  dedupingInterval: 1 * 60 * 1000,
};

// TODO: This needs to be optimized as it is causing significant performance pause & many requests. Instead of loading all the data at once, prefer a lazy/incremental approach such as paginated approach. Will need to adjust the consumer component of this hook to handle paginated data.
const useAllValidatorsData = () => {
  const { rpcEndpoint } = useRpcEndpointStore();

  const { data: activeValidatorsData } = useSWR(
    SwrBaseKey.ACTIVE_VALIDATORS,
    useCallback(() => getActiveValidators(rpcEndpoint), [rpcEndpoint]),
    swrConfig
  );

  const { data: waitingValidatorsData } = useSWR(
    SwrBaseKey.WAITING_VALIDATORS,
    useCallback(() => getWaitingValidators(rpcEndpoint), [rpcEndpoint]),
    swrConfig
  );

  const allValidators = useMemo(
    () => [...(activeValidatorsData ?? []), ...(waitingValidatorsData ?? [])],
    [activeValidatorsData, waitingValidatorsData]
  );

  return allValidators;
};

export default useAllValidatorsData;
