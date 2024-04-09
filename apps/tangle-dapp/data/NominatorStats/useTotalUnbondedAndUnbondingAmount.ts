'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import useUnbondingRemainingErasSubscription from './useUnbondingRemainingErasSubscription';

type UnbondedAndUnbondingAmount = {
  unbonded: BN;
  unbonding: BN;
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
    if (!unbondingRemainingErasData?.value1) {
      return [];
    }

    return unbondingRemainingErasData.value1;
  }, [unbondingRemainingErasData?.value1]);

  useEffect(() => {
    if (unbondingRemainingErasError) {
      setError(unbondingRemainingErasError);
      setIsLoading(false);

      return;
    }

    if (unbondingRemainingEras.length === 0) {
      setValue1({ unbonded: BN_ZERO, unbonding: BN_ZERO });
      setIsLoading(false);

      return;
    }

    let unbondedAmount = BN_ZERO;
    let unbondingAmount = BN_ZERO;

    unbondingRemainingEras.forEach((era) => {
      if (era.remainingEras <= 0) {
        unbondedAmount = unbondedAmount.add(era.amount);
      } else if (era.remainingEras > 0) {
        unbondingAmount = unbondingAmount.add(era.amount);
      }
    });

    setValue1({ unbonded: unbondedAmount, unbonding: unbondingAmount });
    setIsLoading(false);
  }, [unbondingRemainingEras, unbondingRemainingErasError]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
