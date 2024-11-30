'use client';

import { BN } from '@polkadot/util';
import { useMemo } from 'react';

import useUnbonding from '../staking/useUnbonding';

const useUnbondingAmount = () => {
  const { result: unbondingEntriesOpt, ...other } = useUnbonding();

  const unbondingTotalAmount = useMemo(() => {
    if (unbondingEntriesOpt === null) {
      return null;
    }

    return unbondingEntriesOpt.map((entries) =>
      entries
        // Only consider the entries that have remaining eras.
        .filter((entry) => entry.remainingEras.gten(1))
        // Sum their amounts.
        .reduce((acc, entry) => acc.add(entry.amount), new BN(0)),
    );
  }, [unbondingEntriesOpt]);

  return { result: unbondingTotalAmount, ...other };
};

export default useUnbondingAmount;
