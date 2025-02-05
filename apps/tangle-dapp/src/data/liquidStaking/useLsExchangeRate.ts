import { useCallback } from 'react';

import { LsNetworkId } from '../../constants/liquidStaking/types';
import { useLsStore } from './useLsStore';
import { useQuery } from '@tanstack/react-query';

const MAX_BN_OPERATION_NUMBER = 2 ** 26 - 1;

const useLsExchangeRate = () => {
  const { lsNetworkId } = useLsStore();

  const fetch = useCallback(async () => {
    let promise: Promise<number | Error | null>;

    switch (lsNetworkId) {
      // Tangle networks with the `lst` pallet have a fixed exchange
      // rate of 1:1.
      case LsNetworkId.TANGLE_LOCAL:
      case LsNetworkId.TANGLE_MAINNET:
      case LsNetworkId.TANGLE_TESTNET:
        promise = Promise.resolve(1);
    }

    const newExchangeRate = await promise;

    // Still loading. Do not update the value. Display the stale
    // value.
    if (newExchangeRate === null) {
      return null;
    }

    return newExchangeRate;
  }, [lsNetworkId]);

  const { data: exchangeRate } = useQuery({
    queryKey: ['useLsExchangeRate', lsNetworkId],
    queryFn: fetch,
  });

  // For some undocumented reason, BN.js can perform number operations
  // on BN instances that are up to 2^26 - 1.
  return typeof exchangeRate === 'number'
    ? Math.min(MAX_BN_OPERATION_NUMBER, exchangeRate)
    : exchangeRate;
};

export default useLsExchangeRate;
