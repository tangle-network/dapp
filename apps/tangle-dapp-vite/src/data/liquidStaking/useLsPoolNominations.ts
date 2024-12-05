import { useMemo } from 'react';

import { SubstrateAddress } from '../../types/utils';
import useLsPoolBondedAccounts from './useLsPoolBondedAccounts';
import useNominators from './useNominators';

const useLsPoolNominations = (): Map<number, SubstrateAddress[]> | null => {
  const nominators = useNominators();
  const poolBondedAccounts = useLsPoolBondedAccounts();

  const targets = useMemo(() => {
    if (poolBondedAccounts === null || nominators === null) {
      return null;
    }

    return Array.from(poolBondedAccounts.entries()).flatMap(
      ([poolId, owner]) => {
        const nominations = nominators.get(owner);

        // Ignore pools with no nominations.
        if (nominations === undefined) {
          return [];
        }

        return [[poolId, nominations ?? []]] as const;
      },
    );
  }, [nominators, poolBondedAccounts]);

  const map = useMemo(() => {
    if (targets === null) {
      return null;
    }

    return new Map(targets);
  }, [targets]);

  return map;
};

export default useLsPoolNominations;
