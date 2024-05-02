'use client';

import { Option, u64 } from '@polkadot/types';
import { TanglePrimitivesJobsJobInfo } from '@polkadot/types/lookup';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import {
  createContext,
  FC,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';

import { Service } from '../types';
import {
  extractServiceDetails,
  getPolkadotApiPromise,
} from '../utils/polkadot';
import useNetworkStore from './useNetworkStore';

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
  const { rpcEndpoint } = useNetworkStore();
  const { notificationApi } = useWebbUI();

  const [serviceDetails, setServiceDetails] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: We can Utilizing caching for Mainnet and possibly Testnet, not implement at the moment
    // because restaking system is being updated
    // For local, the data will be updated frequently
    const fetchServiceDetails = async () => {
      if (!serviceId) return;
      try {
        const api = await getPolkadotApiPromise(rpcEndpoint);
        const jobInfoData = (await api.query.jobs.submittedJobs(
          // no provided type here, only Id
          null,
          new u64(api.registry, BigInt(serviceId))
        )) as Option<TanglePrimitivesJobsJobInfo>; // Return as Codec type
        const extractedServiceData = extractServiceDetails(
          serviceId,
          jobInfoData
        );
        setServiceDetails(extractedServiceData);
        setIsLoading(false);
      } catch (error) {
        notificationApi({
          message: 'Failed to load service',
          variant: 'error',
        });
      }
    };

    fetchServiceDetails();
  }, [rpcEndpoint, serviceId, notificationApi]);

  return (
    <ServiceDetailsContext.Provider value={{ serviceDetails, isLoading }}>
      {children}
    </ServiceDetailsContext.Provider>
  );
};

export default ServiceDetailsProvider;
