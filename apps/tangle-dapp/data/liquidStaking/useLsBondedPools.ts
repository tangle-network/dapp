import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';

const useLsBondedPools = () => {
  const networkFeatures = useNetworkFeatures();
  const isSupported = networkFeatures.includes(NetworkFeature.LsPools);

  const { result: rawBondedPools } = useApiRx(
    useCallback(
      (api) => {
        if (!isSupported) {
          return null;
        }

        return api.query.lst.bondedPools.entries();
      },
      [isSupported],
    ),
  );

  const tanglePools = useMemo(() => {
    if (rawBondedPools === null) {
      return null;
    }

    return rawBondedPools.flatMap(([poolIdKey, valueOpt]) => {
      // Skip empty values.
      if (valueOpt.isNone) {
        return [];
      }

      const tanglePool = valueOpt.unwrap();

      // Ignore all non-open pools.
      if (!tanglePool.state.isOpen) {
        return [];
      }

      return [[poolIdKey.args[0].toNumber(), tanglePool] as const];
    });
  }, [rawBondedPools]);

  // TODO: Add explicit error state: `| Error`. For example, in case that the active network doesn't support liquid staking pools.
  return tanglePools;
};

export default useLsBondedPools;
