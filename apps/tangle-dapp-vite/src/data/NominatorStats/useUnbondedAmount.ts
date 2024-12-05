import { BN } from '@polkadot/util';
import { useMemo } from 'react';

import useUnbonding from '../staking/useUnbonding';

const useUnbondedAmount = () => {
  const { result: unbondingEntriesOpt, ...other } = useUnbonding();

  const unbondedTotalAmount = useMemo(() => {
    if (unbondingEntriesOpt === null) {
      return null;
    }

    return unbondingEntriesOpt.map((entries) =>
      entries.reduce((acc, entry) => {
        // Only consider those entries whose remaining eras
        // are less than or equal to 0 (ie. already unbonded).
        if (entry.remainingEras.lten(0)) {
          return acc.add(entry.amount);
        }

        // Do not add to unbonded amount if the entry
        // is still in the unbonding period.
        return acc;
      }, new BN(0)),
    );
  }, [unbondingEntriesOpt]);

  return { result: unbondedTotalAmount, ...other };
};

export default useUnbondedAmount;
