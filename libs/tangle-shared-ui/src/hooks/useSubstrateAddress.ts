import { useMemo } from 'react';
import { SubstrateAddress } from '../types/utils';
import useNetworkStore from '../context/useNetworkStore';
import toSubstrateAddress from '../utils/toSubstrateAddress';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';

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
const useSubstrateAddress = (): SubstrateAddress | null => {
  const [activeAccount] = useActiveAccount();
  const { network } = useNetworkStore();

  const substrateAddress = useMemo(() => {
    // Wait for the active account address to be set.
    if (activeAccount === null) {
      return null;
    }

    // Note that this handles both EVM and Substrate addresses,
    // so there's no need to check if the address is an EVM address
    // or not.
    return toSubstrateAddress(activeAccount.address, network.ss58Prefix);
  }, [activeAccount, network.ss58Prefix]);

  return substrateAddress;
};

export default useSubstrateAddress;
