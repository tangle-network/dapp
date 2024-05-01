'use client';

import { BN } from '@polkadot/util';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { useEffect, useState } from 'react';

import {
  TANGLE_TO_SERVICE_TYPE_TSS_MAP,
  TANGLE_TO_SERVICE_TYPE_ZK_SAAS_MAP,
} from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import { Service } from '../../types';
import ensureError from '../../utils/ensureError';
import { getPolkadotApiPromise } from '../../utils/polkadot/api';
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
              if (!jobInfoData.isSome) {
                throw new Error('Job info not found');
              } else {
                const jobInfo = jobInfoData.unwrap();
                // TODO: cache
                const jobType = jobInfo.jobType;
                if (jobType.isNone) {
                  throw new Error('Error fetching data for specific job');
                }
                const id = service.id.toString();
                const expirationBlock = jobInfo.expiry.toString();
                const fee = jobInfo.fee.toBn();

                if (jobType.isDkgtssPhaseOne) {
                  const jobDetails = jobType.asDkgtssPhaseOne;
                  const participantsNum = jobDetails.participants.length;
                  return {
                    id,
                    serviceType:
                      TANGLE_TO_SERVICE_TYPE_TSS_MAP[jobDetails.roleType.type],
                    participants: participantsNum,
                    threshold: jobDetails.threshold.toNumber(),
                    expirationBlock,
                    earnings: fee.div(new BN(participantsNum)),
                  };
                } else if (jobType.isZkSaaSPhaseOne) {
                  const jobDetails = jobType.asZkSaaSPhaseOne;
                  const participantsNum = jobDetails.participants.length;
                  return {
                    id,
                    serviceType:
                      TANGLE_TO_SERVICE_TYPE_ZK_SAAS_MAP[
                        jobDetails.roleType.type
                      ],
                    participants: participantsNum,
                    expirationBlock,
                    earnings: fee.div(new BN(participantsNum)),
                  };
                } else {
                  return null;
                }
              }
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
