import { useCallback } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useRestakingRoleLedger = (address?: string) => {
  const activeSubstrateAccount = useSubstrateAddress();

  return usePolkadotApiRx(
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
