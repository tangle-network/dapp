'use client';

import { useEffect, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import type { ServiceParticipant } from '../../types';
import { getAccountInfo } from '../../utils/polkadot/identity';
import useServiceDetails from './useServiceDetails';

export default function useServiceParticipants() {
  const { rpcEndpoint } = useNetworkStore();
  const { serviceDetails, isLoading: isLoadingServiceDetails } =
    useServiceDetails();
  const [participants, setParticipants] = useState<ServiceParticipant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);

  useEffect(() => {
    const fetchParticipantsInfo = async () => {
      const participantAddresses = serviceDetails?.participants ?? [];
      const participantsInfo = await Promise.all(
        participantAddresses.map(async (address) => {
          const accountInfo = await getAccountInfo(rpcEndpoint, address);
          return {
            address,
            ...(accountInfo ?? {}),
          } satisfies ServiceParticipant;
        })
      );
      setParticipants(participantsInfo);
      setIsLoadingParticipants(false);
    };

    fetchParticipantsInfo();
  }, [rpcEndpoint, serviceDetails?.participants]);

  return {
    isLoading: isLoadingServiceDetails || isLoadingParticipants,
    data: participants,
  };
}
