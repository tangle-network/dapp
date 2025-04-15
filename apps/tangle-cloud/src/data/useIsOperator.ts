import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import { isSubstrateAddress } from '@tangle-network/ui-components';
import { useMemo } from 'react';

/**
 * useIsOperator
 * @returns true if connected wallet is Substrate wallet
 */
export const useIsOperator = () => {
  const address = useActiveAccountAddress();

  const isOperator = useMemo(() => {
    if (!address || !isSubstrateAddress(address.toString())) {
      return false;
    }

    return true;
  }, [address]);

  return isOperator;
};
