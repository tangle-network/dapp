import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import useLocalStorage, {
  LocalStorageKey,
} from '@webb-tools/tangle-shared-ui/hooks/useLocalStorage';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import { useEffect, useMemo, useState } from 'react';

const usePayoutsAvailability = () => {
  const { valueOpt: cachedPayouts } = useLocalStorage(LocalStorageKey.PAYOUTS);
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
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
