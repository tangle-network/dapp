'use client';

import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { useEffect, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { Service } from '../../types';
import ensureError from '../../utils/ensureError';
import {
  extractServiceDetails,
  getPolkadotApiPromise,
} from '../../utils/polkadot';
import useJobIdAndTypeLookupByValidator from '../useJobIdAndTypeLookupByValidator';

export default function useActiveServicesByValidator(validatorAddress: string) {
  const { rpcEndpoint } = useNetworkStore();
  const { notificationApi } = useWebbUI();
  const {
    data: validatorIdAndTypeLookup,
    isLoading: isLoadingValidatorIdAndTypeLookup,
    error: validatorIdAndTypeLookupError,
  } = useJobIdAndTypeLookupByValidator(validatorAddress);

  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [errorLoadingServices, setErrorLoadingServices] =
    useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (validatorIdAndTypeLookup === null) {
        setServices([]);
        return;
      }

      try {
        const api = await getPolkadotApiPromise(rpcEndpoint);
        const fetchedServices = (
          await Promise.all(
            validatorIdAndTypeLookup.map(async (service) => {
              const jobInfoData = await api.query.jobs.submittedJobs(
                service.type,
                service.id
              );
              const extractedServiceData = extractServiceDetails(
                service.id.toString(),
                jobInfoData
              );
              if (extractedServiceData === null) {
                throw new Error('Failed to get service data');
              }
              return extractedServiceData;
            })
          )
        ).filter((service) => service !== null) as Service[];
        setServices(fetchedServices);
      } catch (error) {
        setErrorLoadingServices(ensureError(error));
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchData();
  }, [notificationApi, validatorIdAndTypeLookup, rpcEndpoint]);

  useEffect(() => {
    if (validatorIdAndTypeLookupError || errorLoadingServices) {
      notificationApi({
        message: 'Failed to load services',
        variant: 'error',
      });
    }
  }, [notificationApi, validatorIdAndTypeLookupError, errorLoadingServices]);

  return {
    services,
    isLoading: isLoadingValidatorIdAndTypeLookup || isLoadingServices,
  };
}
