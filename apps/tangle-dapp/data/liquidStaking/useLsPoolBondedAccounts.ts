import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import { SubstrateAddress } from '../../types/utils';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';

const useLsPoolBondedAccounts = (): Map<number, SubstrateAddress> | null => {
  const { result: entries } = useApiRx(
    useCallback((api) => {
      return api.query.lst.reversePoolIdLookup.entries();
    }, []),
  );

  const keyValuePairs = useMemo(() => {
    if (entries === null) {
      return null;
    }

    return entries.flatMap(([key, valueOpt]) => {
      // Ignore empty values.
      if (valueOpt.isNone) {
        return [];
      }

      const poolId = valueOpt.unwrap().toNumber();

      const bondedAccountAddress = assertSubstrateAddress(
        key.args[0].toString(),
      );

      return [[poolId, bondedAccountAddress]] as const;
    });
  }, [entries]);

  const map = useMemo(() => {
    if (keyValuePairs === null) {
      return null;
    }

    return new Map(keyValuePairs);
  }, [keyValuePairs]);

  return map;
};

export default useLsPoolBondedAccounts;
