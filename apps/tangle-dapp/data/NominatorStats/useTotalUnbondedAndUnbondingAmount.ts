'use client';

import { useEffect, useMemo, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import { splitTokenValueAndSymbol } from '../../utils/splitTokenValueAndSymbol';
import useUnbondingRemainingErasSubscription from './useUnbondingRemainingErasSubscription';

type UnbondedAndUnbondingAmount = {
  unbonded: number;
  unbonding: number;
};

export default function useTotalUnbondedAndUnbondingAmount(
  address: string,
  defaultValue: { value1: UnbondedAndUnbondingAmount | null } = {
    value1: null,
  }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    data: unbondingRemainingErasData,
    error: unbondingRemainingErasError,
  } = useUnbondingRemainingErasSubscription(address);

  const unbondingRemainingEras = useMemo(() => {
    if (!unbondingRemainingErasData?.value1) return [];

    return unbondingRemainingErasData.value1;
  }, [unbondingRemainingErasData?.value1]);

  useEffect(() => {
    if (unbondingRemainingErasError) {
      setError(unbondingRemainingErasError);
      setIsLoading(false);
      return;
    }

    if (unbondingRemainingEras.length === 0) {
      setValue1({ unbonded: 0, unbonding: 0 });
      setIsLoading(false);
      return;
    }

    let unbondedAmount = 0;
    let unbondingAmount = 0;

    unbondingRemainingEras.forEach((era) => {
      const { value: amount } = splitTokenValueAndSymbol(era.amount);

      if (era.remainingEras <= 0) {
        unbondedAmount += Number(amount);
      } else if (era.remainingEras > 0) {
        unbondingAmount += Number(amount);
      }
    });

    setValue1({ unbonded: unbondedAmount, unbonding: unbondingAmount });
    setIsLoading(false);
  }, [unbondingRemainingEras, unbondingRemainingErasError]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
