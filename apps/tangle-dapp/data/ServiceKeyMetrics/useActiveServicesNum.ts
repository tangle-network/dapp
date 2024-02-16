'use client';

import { useEffect, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';

export default function useActiveServicesNum() {
  const [activeServicesNum, setActiveServicesNum] = useState<number | null>(
    null
  );
  const [activeServicesChangeRate, setActiveServicesChangeRate] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  //   TODO: Integrate backend
  useEffect(() => {
    setActiveServicesNum(5);
    setActiveServicesChangeRate(-10.76);
    setError(null);
    setIsLoading(false);
  }, []);

  return useFormatReturnType({
    isLoading,
    error,
    data: { value: activeServicesNum, changeRate: activeServicesChangeRate },
  });
}
