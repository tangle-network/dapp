import { useCallback } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

const useRestakingRoleLedger = (address: string | null) => {
  return usePolkadotApiRx(
    useCallback(
      (api) => {
        if (address === null) {
          return null;
        }

        return api.query.roles.ledger(address);
      },
      [address]
    )
  );
};

export default useRestakingRoleLedger;
