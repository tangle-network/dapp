import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { useMemo } from 'react';

import { convertToSubstrateAddress } from '../utils';

/**
 * Obtain the Substrate address of the active account, if any.
 * This provides a centralized way to always work with a Substrate
 * address, regardless of the active account.
 *
 * @remarks
 * If there is no active account, `null` will be returned instead.
 * If the active account is an EVM account, its EVM address will be
 * converted into a Substrate address via hashing.
 */
const useSubstrateAddress = () => {
  const activeAccount = useActiveAccount();
  const activeAccountAddress = activeAccount[0]?.address ?? null;

  const substrateAddress = useMemo(() => {
    // Wait for the active account to be set.
    if (activeAccountAddress === null) {
      return null;
    }

    // Note that this handles both EVM and Substrate addresses,
    // so there's no need to check if the address is an EVM address
    // or not.
    return convertToSubstrateAddress(activeAccountAddress);
  }, [activeAccountAddress]);

  return substrateAddress;
};

export default useSubstrateAddress;
