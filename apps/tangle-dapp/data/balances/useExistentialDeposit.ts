'use client';

import { BN_ONE } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';

import usePolkadotApi from '../../hooks/usePolkadotApi';

function useExistentialDeposit() {
  // Default existential deposit is 1 unit.
  const [existentialDeposit, setExistentialDeposit] = useState(BN_ONE);

  const { isApiLoading, isValueLoading, error, value } = usePolkadotApi(
    useCallback(async (api) => api.consts.balances.existentialDeposit, [])
  );

  useEffect(() => {
    if (isApiLoading || isValueLoading || error !== null || value === null) {
      return;
    }

    setExistentialDeposit((prev) => (value.eq(prev) ? prev : value));
  }, [error, isApiLoading, isValueLoading, value]);

  return existentialDeposit;
}

export default useExistentialDeposit;
