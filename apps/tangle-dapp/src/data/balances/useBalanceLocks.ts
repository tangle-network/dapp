import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { useCallback } from 'react';

const useBalanceLocks = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: locks, ...other } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.balances.locks(activeSubstrateAddress);
      },
      [activeSubstrateAddress],
    ),
  );

  const hasLocks = locks !== null && locks.length > 0;

  return { locks, ...other, hasLocks };
};

export default useBalanceLocks;
