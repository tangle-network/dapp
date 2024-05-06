'use client';

import { useEffect, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import type { ServiceJob } from '../../types';

const jobsArr = new Array(11).fill({
  id: '9',
  txHash: '0xa005470a32499ef40990f884d67326d11237c781b62fd9bd0f97cc066c70779e',
  timestamp: new Date(),
} satisfies ServiceJob);

export default function useServiceJobs(_: string) {
  const [jobs, setJobs] = useState<ServiceJob[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // TODO: integrate backend
  useEffect(() => {
    setIsLoading(false);
    setError(null);
    setJobs(jobsArr);
  }, []);

  return useFormatReturnType({
    isLoading,
    error,
    data: jobs,
  });
}
