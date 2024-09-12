import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';

const useLsBondedPools = () => {
  const { result: rawBondedPools } = useApiRx(
    useCallback((api) => {
      return api.query.lst.bondedPools.entries();
    }, []),
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

  return tanglePools;
};

export default useLsBondedPools;
