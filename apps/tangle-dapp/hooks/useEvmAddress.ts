import { isEvmAddress32, toEvmAddress20 } from '@webb-tools/webb-ui-components';
import { EvmAddress20 } from '@webb-tools/webb-ui-components/types/address';
import { useMemo } from 'react';

import useActiveAccountAddress from './useActiveAccountAddress';

/**
 * Obtain the EVM address of the active account, if any.
 *
 * @remarks
 * If there is no active account, `null` will be returned instead.
 */
const useEvmAddress20 = (): EvmAddress20 | null => {
  const activeAccountAddress = useActiveAccountAddress();

  const evmAddress = useMemo(() => {
    // Wait for the active account to be set, and ensure
    // that the active account is an EVM account.
    if (
      activeAccountAddress === null ||
      !isEvmAddress32(activeAccountAddress)
    ) {
      return null;
    }

    // TODO: May need to convert to an EVM address, in case that the active account is a EVM account. See https://github.com/webb-tools/tangle/issues/379 for more details.
    return toEvmAddress20(activeAccountAddress);
  }, [activeAccountAddress]);

  return evmAddress;
};

export default useEvmAddress20;
