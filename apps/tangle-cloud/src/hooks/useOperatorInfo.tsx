import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { toSubstrateAddress } from '@tangle-network/ui-components/utils/toSubstrateAddress';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import { useMemo } from 'react';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { isEvmAddress } from '@tangle-network/ui-components';

type UseOperatorInfo = {
  operatorAddress: SubstrateAddress | null;
  isOperator: boolean;
};

const useOperatorInfo = (useSs58Prefix = true): UseOperatorInfo => {
  const [activeAccount] = useActiveAccount();
  const { network } = useNetworkStore();

  const substrateAddress = useMemo(() => {
    let operatorAddress: SubstrateAddress | null = null;
    let isOperator = false;

    // Wait for the active account address to be set.
    if (activeAccount === null) {
      return {
        operatorAddress,
        isOperator,
      };
    }

    if (
      isSolanaAddress(activeAccount.address) ||
      isEvmAddress(activeAccount.address)
    ) {
      return {
        operatorAddress,
        isOperator,
      };
    }

    // Determine the prefix to use based on the useSs58Prefix parameter.
    const prefix = useSs58Prefix ? network.ss58Prefix : undefined;

    try {
      operatorAddress = toSubstrateAddress(activeAccount.address, prefix);
      isOperator = true;
    } catch (err) {
      console.error('Error converting address to Substrate format:', err);
    }

    return {
      operatorAddress,
      isOperator,
    };
  }, [activeAccount, network.ss58Prefix, useSs58Prefix]);

  return substrateAddress;
};

export default useOperatorInfo;
