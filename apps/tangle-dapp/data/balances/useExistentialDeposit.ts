'use client';

import { BN_ONE } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';

import useApi from '../../hooks/useApi';

function useExistentialDeposit() {
  // Default existential deposit is 1 unit.
  const [existentialDeposit, setExistentialDeposit] = useState(BN_ONE);

  const { result } = useApi(
    useCallback(async (api) => api.consts.balances.existentialDeposit, [])
  );

  useEffect(() => {
    if (result === null) {
      return;
    }

    setExistentialDeposit((prev) => (result.eq(prev) ? prev : result));
  }, [result]);

  return existentialDeposit;
}

export default useExistentialDeposit;
