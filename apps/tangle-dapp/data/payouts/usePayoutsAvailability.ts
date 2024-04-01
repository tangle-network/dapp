import { useEffect, useState } from 'react';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import usePayouts from '../DelegationsPayouts/usePayouts';

const usePayoutsAvailability = () => {
  const activeSubstrateAddress = useSubstrateAddress();
  const { data: payouts } = usePayouts(activeSubstrateAddress ?? '');
  const [isPayoutsAvailable, setIsPayoutsAvailable] = useState(false);

  useEffect(() => {
    if (payouts !== null) {
      setIsPayoutsAvailable(!!payouts.payouts.length);
    }
  }, [payouts]);

  return isPayoutsAvailable;
};

export default usePayoutsAvailability;
