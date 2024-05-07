'use client';

import { Option, u64 } from '@polkadot/types';
import { TanglePrimitivesJobsJobInfo } from '@polkadot/types/lookup';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
} from 'react';

import usePolkadotApi, { PolkadotApiFetcher } from '../hooks/usePolkadotApi';
import { Service } from '../types';
import { extractServiceDetails } from '../utils/polkadot';

export const ServiceDetailsContext = createContext<{
  serviceDetails: Service | null;
  isLoading: boolean;
}>({
  serviceDetails: null,
  isLoading: true,
});

const ServiceDetailsProvider: FC<PropsWithChildren<{ serviceId: string }>> = ({
  children,
  serviceId,
}) => {
  const { notificationApi } = useWebbUI();

  const servicesFetcher = useCallback<PolkadotApiFetcher<Service | null>>(
    async (api) => {
      const jobInfoData = (await api.query.jobs.submittedJobs(
        // no provided type here, only Id
        null,
        new u64(api.registry, BigInt(serviceId))
      )) as Option<TanglePrimitivesJobsJobInfo>; // Data is returned as Codec type here
      return extractServiceDetails(serviceId, jobInfoData);
    },
    [serviceId]
  );

  const {
    value: serviceDetails,
    isValueLoading: isLoading,
    error,
  } = usePolkadotApi(servicesFetcher);

  useEffect(() => {
    if (error) {
      notificationApi({
        message: 'Failed to load service',
        variant: 'error',
      });
    }
  }, [error, notificationApi]);

  return (
    <ServiceDetailsContext.Provider value={{ serviceDetails, isLoading }}>
      {children}
    </ServiceDetailsContext.Provider>
  );
};

export default ServiceDetailsProvider;
