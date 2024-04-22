import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useRestakingRoleLedger = (address?: string) => {
  const activeSubstrateAccount = useSubstrateAddress();

  return useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAccount === null) {
          return null;
        }

        return api.query.roles.ledger(address ?? activeSubstrateAccount);
      },
      [address, activeSubstrateAccount]
    )
  );
};

export default useRestakingRoleLedger;
