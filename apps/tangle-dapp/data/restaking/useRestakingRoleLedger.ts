import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';

const useRestakingRoleLedger = (address: string | null) => {
  return useApiRx(
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
