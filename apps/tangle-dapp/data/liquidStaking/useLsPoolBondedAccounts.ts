import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';
import { SubstrateAddress } from '../../types/utils';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';

const useLsPoolBondedAccounts = (): Map<number, SubstrateAddress> | null => {
  const networkFeatures = useNetworkFeatures();
  const isSupported = networkFeatures.includes(NetworkFeature.LsPools);

  const { result: entries } = useApiRx(
    useCallback(
      (api) => {
        if (!isSupported) {
          return null;
        }

        return api.query.lst.reversePoolIdLookup.entries();
      },
      [isSupported],
    ),
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

  // TODO: Add error state. For example, in case that the active network doesn't support liquid staking pools.
  return map;
};

export default useLsPoolBondedAccounts;
