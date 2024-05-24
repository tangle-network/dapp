'use client';

import { Option, u64 } from '@polkadot/types';
import { TanglePrimitivesJobsJobInfo } from '@polkadot/types/lookup';
import { createContext, FC, PropsWithChildren, useCallback } from 'react';

import useApi, { ApiFetcher } from '../hooks/useApi';
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
  const servicesFetcher = useCallback<ApiFetcher<Service | null>>(
    async (api) => {
      const jobInfoData = (await api.query.jobs.submittedJobs(
        // no provided type here, only Id
        null,
        new u64(api.registry, BigInt(serviceId)),
      )) as Option<TanglePrimitivesJobsJobInfo>; // Data is returned as Codec type here
      return extractServiceDetails(serviceId, jobInfoData);
    },
    [serviceId],
  );

  const { result: serviceDetails } = useApi(servicesFetcher);

  return (
    <ServiceDetailsContext.Provider
      value={{ serviceDetails, isLoading: serviceDetails === null }}
    >
      {children}
    </ServiceDetailsContext.Provider>
  );
};

export default ServiceDetailsProvider;
