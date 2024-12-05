import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import useLocalStorage, {
  LocalStorageKey,
} from '@webb-tools/tangle-shared-ui/hooks/useLocalStorage';
import { useEffect, useMemo, useState } from 'react';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const usePayoutsAvailability = () => {
  const { valueOpt: cachedPayouts } = useLocalStorage(LocalStorageKey.PAYOUTS);
  const { rpcEndpoint } = useNetworkStore();
  const address = useSubstrateAddress();

  const payoutsData = useMemo(() => {
    if (
      cachedPayouts === null ||
      cachedPayouts.value === null ||
      address === null
    ) {
      return [];
    }

    const payouts = cachedPayouts.value[rpcEndpoint]?.[address];

    return payouts ?? [];
  }, [address, cachedPayouts, rpcEndpoint]);

  const [isPayoutsAvailable, setIsPayoutsAvailable] = useState(false);

  useEffect(() => {
    if (payoutsData !== null) {
      setIsPayoutsAvailable(!!payoutsData.length);
    }
  }, [payoutsData]);

  return isPayoutsAvailable;
};

export default usePayoutsAvailability;
