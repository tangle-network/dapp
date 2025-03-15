import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const MAX_BN_OPERATION_NUMBER = 2 ** 26 - 1;

const useLsExchangeRate = () => {
  const network = useNetworkStore((store) => store.network2);

  const fetch = useCallback(async () => {
    // Tangle networks with the `lst` pallet have a fixed exchange
    // rate of 1:1.
    const newExchangeRate = await Promise.resolve(1);

    return newExchangeRate === null ? null : newExchangeRate;
  }, []);

  const { data: exchangeRate } = useQuery({
    queryKey: ['useLsExchangeRate', network?.id],
    queryFn: fetch,
  });

  // For some undocumented reason, BN.js can perform number operations
  // on BN instances that are up to 2^26 - 1.
  return typeof exchangeRate === 'number'
    ? Math.min(MAX_BN_OPERATION_NUMBER, exchangeRate)
    : exchangeRate;
};

export default useLsExchangeRate;
