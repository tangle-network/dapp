import { useEffect, useState } from 'react';

import usePayouts from '../NominationsPayouts/usePayouts';

const usePayoutsAvailability = () => {
  const payoutsData = usePayouts();
  const [isPayoutsAvailable, setIsPayoutsAvailable] = useState(false);

  useEffect(() => {
    if (payoutsData !== null) {
      setIsPayoutsAvailable(!!payoutsData.length);
    }
  }, [payoutsData]);

  return isPayoutsAvailable;
};

export default usePayoutsAvailability;
