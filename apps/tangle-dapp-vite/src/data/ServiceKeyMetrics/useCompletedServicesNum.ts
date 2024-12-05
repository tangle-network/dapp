'use client';

import { useEffect, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';

export default function useCompletedServicesNum() {
  const [CompletedServicesNum, setCompletedServicesNum] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  //   TODO: Integrate backend
  useEffect(() => {
    setCompletedServicesNum(123);
    setError(null);
    setIsLoading(false);
  }, []);

  return useFormatReturnType({ isLoading, error, data: CompletedServicesNum });
}
