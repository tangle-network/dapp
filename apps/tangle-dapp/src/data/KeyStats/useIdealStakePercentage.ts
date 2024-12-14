import { BN_ZERO } from '@polkadot/util';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { getApiPromise } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
import { useEffect, useState } from 'react';

import { calculateInflation } from '../../utils';

export default function useIdealStakedPercentage(
  defaultValue: { value1: number | null } = { value1: null },
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await getApiPromise(rpcEndpoint);
        const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);
        const idealStakePercentage = inflation.idealStake * 100;

        if (idealStakePercentage !== value1) {
          setValue1(idealStakePercentage);
        }

        setIsLoading(false);
      } catch (possibleError) {
        setError(ensureError(possibleError));
        setIsLoading(false);
      }
    };

    fetchData();
  }, [value1, rpcEndpoint]);

  return {
    isLoading,
    error,
    data: { value1, value2: null },
  };
}
