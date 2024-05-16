import { useEffect, useMemo, useState } from 'react';

import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const usePayoutsAvailability = () => {
  const { valueAfterMount: cachedPayouts } = useLocalStorage(
    LocalStorageKey.PAYOUTS,
    true
  );
  const address = useSubstrateAddress();

  const payoutsData = useMemo(() => {
    if (!cachedPayouts || !address) return [];
    return cachedPayouts[address] || [];
  }, [address, cachedPayouts]);

  const [isPayoutsAvailable, setIsPayoutsAvailable] = useState(false);

  useEffect(() => {
    if (payoutsData !== null) {
      setIsPayoutsAvailable(!!payoutsData.length);
    }
  }, [payoutsData]);

  return isPayoutsAvailable;
};

export default usePayoutsAvailability;
