'use client';

import { useEffect, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';

export default function useActiveParticipantsNum() {
  const [activeParticipantsNum, setActiveParticipantsNum] = useState<
    number | null
  >(null);
  const [activeParticipantsChangeRate, setActiveParticipantsChangeRate] =
    useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // TODO: Integrate backend
  useEffect(() => {
    setActiveParticipantsNum(29);
    setActiveParticipantsChangeRate(11.01);
    setError(null);
    setIsLoading(false);
  }, []);

  return useFormatReturnType({
    isLoading,
    error,
    data: {
      value: activeParticipantsNum,
      changeRate: activeParticipantsChangeRate,
    },
  });
}
