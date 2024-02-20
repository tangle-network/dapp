import { useEffect, useState } from 'react';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import usePayouts from '../DelegationsPayouts/usePayouts';

const usePayoutsAvailability = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { data: payouts } = usePayouts(activeSubstrateAddress ?? '');

  const [isPayoutsAvailable, setIsPayoutsAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (payouts) {
      setIsPayoutsAvailable(!!payouts.payouts.length);
    }
  }, [payouts]);

  return isPayoutsAvailable;
};

export default usePayoutsAvailability;
