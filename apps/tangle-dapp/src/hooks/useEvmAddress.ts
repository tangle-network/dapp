import { isEvmAddress, toEvmAddress } from '@webb-tools/webb-ui-components';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { useMemo } from 'react';

import useActiveAccountAddress from './useActiveAccountAddress';

/**
 * Obtain the EVM address of the active account, if any.
 *
 * @remarks
 * If there is no active account, `null` will be returned instead.
 */
const useEvmAddress20 = (): EvmAddress | null => {
  const activeAccountAddress = useActiveAccountAddress();

  const evmAddress = useMemo(() => {
    // Wait for the active account to be set, and ensure
    // that the active account is an EVM account.
    if (activeAccountAddress === null || !isEvmAddress(activeAccountAddress)) {
      return null;
    }

    return toEvmAddress(activeAccountAddress);
  }, [activeAccountAddress]);

  return evmAddress;
};

export default useEvmAddress20;
