import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { toSubstrateAddress } from '@tangle-network/ui-components/utils/toSubstrateAddress';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import { useMemo } from 'react';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { isEvmAddress } from '@tangle-network/ui-components';

const useOperatorAddress = (useSs58Prefix = true): SubstrateAddress | null => {
  const [activeAccount] = useActiveAccount();
  const { network } = useNetworkStore();

  const substrateAddress = useMemo(() => {
    // Wait for the active account address to be set.
    if (activeAccount === null) {
      return null;
    }

    if (isSolanaAddress(activeAccount.address) || isEvmAddress(activeAccount.address)) {
      return null;
    }

    // Determine the prefix to use based on the useSs58Prefix parameter.
    const prefix = useSs58Prefix ? network.ss58Prefix : undefined;

    try {
      // This handles both EVM and Substrate addresses
      return toSubstrateAddress(activeAccount.address, prefix);
    } catch (err) {
      console.error('Error converting address to Substrate format:', err);
      return null;
    }
  }, [activeAccount, network.ss58Prefix, useSs58Prefix]);

  return substrateAddress;
};

export default useOperatorAddress;
