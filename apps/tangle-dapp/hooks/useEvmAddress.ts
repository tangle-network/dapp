import { AddressType } from '@webb-tools/dapp-config/types';
import { useMemo } from 'react';

import { isEvmAddress } from '../utils/isEvmAddress';
import useActiveAccountAddress from './useActiveAccountAddress';

/**
 * Obtain the EVM address of the active account, if any.
 *
 * @remarks
 * If there is no active account, `null` will be returned instead.
 */
const useEvmAddress20 = (): AddressType | null => {
  const activeAccountAddress = useActiveAccountAddress();

  const evmAddress = useMemo(() => {
    // Wait for the active account to be set, and ensure
    // that the active account is an EVM account.
    if (activeAccountAddress === null || !isEvmAddress(activeAccountAddress)) {
      return null;
    }

    // TODO: May need to convert to an EVM address, in case that the active account is a EVM account. See https://github.com/webb-tools/tangle/issues/379 for more details.
    return activeAccountAddress;
  }, [activeAccountAddress]);

  return evmAddress;
};

export default useEvmAddress20;
