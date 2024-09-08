import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import { SubstrateAddress } from '../../types/utils';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';

const useNominators = (): Map<SubstrateAddress, SubstrateAddress[]> | null => {
  const { result: entries } = useApiRx(
    useCallback((api) => {
      return api.query.staking.nominators.entries();
    }, []),
  );

  const keyValuePairs = useMemo(() => {
    if (entries === null) {
      return null;
    }

    return entries.flatMap(([key, value]) => {
      // Ignore empty values.
      if (value.isNone) {
        return [];
      }

      const targets = value
        .unwrap()
        .targets.map((accountId) =>
          assertSubstrateAddress(accountId.toString()),
        );

      const nominatorAddress = assertSubstrateAddress(key.args[0].toString());

      return [[nominatorAddress, targets]] as const;
    });
  }, [entries]);

  const map = useMemo(() => {
    if (entries === null) {
      return null;
    }

    return new Map<SubstrateAddress, SubstrateAddress[]>(keyValuePairs);
  }, [entries, keyValuePairs]);

  return map;
};

export default useNominators;
