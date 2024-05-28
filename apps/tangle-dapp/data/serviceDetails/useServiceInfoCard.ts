'use client';

import { useCallback, useMemo } from 'react';

import useApi from '../../hooks/useApi';
import getBlockDate from '../../utils/getBlockDate';
import useServiceDetails from './useServiceDetails';

export default function useServiceInfoCard() {
  const { serviceDetails, isLoading } = useServiceDetails();

  const { result: currentBlockNumber } = useApi(
    useCallback((api) => api.derive.chain.bestNumber(), [])
  );

  const { result: babeExpectedBlockTime } = useApi(
    useCallback((api) => Promise.resolve(api.consts.babe.expectedBlockTime), [])
  );

  const endingBlockDate = useMemo(() => {
    const ttlBlock = serviceDetails?.ttlBlock;
    if (
      babeExpectedBlockTime === null ||
      currentBlockNumber === null ||
      !ttlBlock
    ) {
      return null;
    }

    return getBlockDate(babeExpectedBlockTime, currentBlockNumber, ttlBlock);
  }, [babeExpectedBlockTime, currentBlockNumber, serviceDetails?.ttlBlock]);

  return {
    isLoading,
    serviceType: serviceDetails?.serviceType ?? null,
    threshold: serviceDetails?.threshold ?? null,
    endDate: endingBlockDate,
  };
}
