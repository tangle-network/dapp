import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { toSubstrateAddress } from '@tangle-network/webb-ui-components/utils/toSubstrateAddress';
import { useMemo } from 'react';
import useNetworkStore from '../context/useNetworkStore';
import type { SubstrateAddress } from '@tangle-network/webb-ui-components/types/address';

/**
 * Obtain the Substrate address of the active account, if any.
 * This provides a centralized way to always work with a Substrate
 * address, regardless of the active account.
 *
 * @remarks
 * If there is no active account, `null` will be returned instead.
 * If the active account is an EVM account, its EVM address will be
 * converted into a Substrate address via hashing.
 *
 * @param useSs58Prefix - A boolean indicating whether to use the ss58Prefix
 * from the network. Defaults to true to maintain current behavior.
 */
const useSubstrateAddress = (useSs58Prefix = true): SubstrateAddress | null => {
  const [activeAccount] = useActiveAccount();
  const { network } = useNetworkStore();

  const substrateAddress = useMemo(() => {
    // Wait for the active account address to be set.
    if (activeAccount === null) {
      return null;
    }

    // Determine the prefix to use based on the useSs58Prefix parameter.
    const prefix = useSs58Prefix ? network.ss58Prefix : undefined;

    // Note that this handles both EVM and Substrate addresses,
    // so there's no need to check if the address is an EVM address
    // or not.
    return toSubstrateAddress(activeAccount.address, prefix);
  }, [activeAccount, network.ss58Prefix, useSs58Prefix]);

  return substrateAddress;
};

export default useSubstrateAddress;
