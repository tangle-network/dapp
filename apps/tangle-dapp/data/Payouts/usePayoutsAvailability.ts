import { isSubstrateAddress } from '@webb-tools/dapp-types';
import { useEffect, useMemo, useState } from 'react';

import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { convertToSubstrateAddress } from '../../utils';
import usePayouts from '../DelegationsPayouts/usePayouts';

const usePayoutsAvailability = () => {
  const activeAccountAddress = useActiveAccountAddress();

  const substrateAddress = useMemo(() => {
    if (!activeAccountAddress) return '';

    if (isSubstrateAddress(activeAccountAddress)) return activeAccountAddress;

    return convertToSubstrateAddress(activeAccountAddress);
  }, [activeAccountAddress]);

  const { data: payouts } = usePayouts(substrateAddress);

  const [isPayoutsAvailable, setIsPayoutsAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (payouts) {
      setIsPayoutsAvailable(!!payouts.payouts.length);
    }
  }, [payouts]);

  return { isPayoutsAvailable };
};

export default usePayoutsAvailability;
