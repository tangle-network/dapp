'use client';

import { Option } from '@polkadot/types';
import { TanglePrimitivesJobsJobInfo } from '@polkadot/types/lookup';
import { createContext, FC, PropsWithChildren, useCallback } from 'react';
import { map } from 'rxjs/operators';

import useApiRx from '../hooks/useApiRx';
import { Service } from '../types';
import { extractServiceDetails } from '../utils/polkadot/services';

export const ServiceOverviewContext = createContext<{
  services: Service[];
  isLoading: boolean;
}>({
  services: [],
  isLoading: true,
});

const ServiceOverviewProvider: FC<PropsWithChildren> = ({ children }) => {
  const { result: services, isLoading } = useApiRx(
    useCallback((api) => {
      return api.query.jobs.submittedJobs.entries().pipe(
        map((jobsData) =>
          jobsData
            .map(([key, job]) => {
              const id = key.args[1].toString();
              const service = extractServiceDetails(
                id,
                job as Option<TanglePrimitivesJobsJobInfo>
              );
              return service;
            })
            .filter((service): service is Service => service !== null)
        )
      );
    }, [])
  );

  return (
    <ServiceOverviewContext.Provider
      value={{ services: services ?? [], isLoading }}
    >
      {children}
    </ServiceOverviewContext.Provider>
  );
};

export default ServiceOverviewProvider;
