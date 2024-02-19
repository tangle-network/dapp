'use client';

import { useEffect, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import type { ServiceParticipant } from '../../types';

const participantsArr = new Array(5).fill({
  address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
  identity: 'participant_1',
  twitter: 'https://twitter.com/tangle_network',
  discord: 'https://discord.com/invite/krp36ZSR8J',
  email: 'someone@example.com',
  web: 'https://tangle.tools/',
} satisfies ServiceParticipant);

export default function useServiceParticipants(serviceId: string) {
  console.log('serviceId :', serviceId);
  const [participants, setParticipants] = useState<ServiceParticipant[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // TODO: integrate backend
  useEffect(() => {
    setIsLoading(false);
    setError(null);
    setParticipants(participantsArr);
  }, []);

  return useFormatReturnType({
    isLoading,
    error,
    data: participants,
  });
}
