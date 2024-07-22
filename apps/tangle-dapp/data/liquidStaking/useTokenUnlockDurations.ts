// This will override global types and provide type definitions for
// the `lstMinting` pallet.
import '@webb-tools/tangle-restaking-types';

import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';

const useTokenUnlockDurations = () => {
  const { result: entries } = useApiRx(
    useCallback((api) => {
      return api.query.lstMinting.unlockDuration.entries();
    }, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const entriesMap = useMemo(() => {
    if (entries === null) {
      return null;
    }

    return new Map(entries.map(([key, value]) => [key.args[0], value]));
  }, [entries]);

  return entriesMap;
};

export default useTokenUnlockDurations;
