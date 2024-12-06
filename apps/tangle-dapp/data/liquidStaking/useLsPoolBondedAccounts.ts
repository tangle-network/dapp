import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { useCallback, useMemo } from 'react';

import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';

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

  // TODO: Add explicit error state: `| Error`. For example, in case that the active network doesn't support liquid staking pools.
  return map;
};

export default useLsPoolBondedAccounts;
