/**
 * EVM version of useOperatorInfo hook.
 * Checks if the connected wallet address is a registered operator.
 */

import { useMemo } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useOperatorMap } from '@tangle-network/tangle-shared-ui/data/graphql';

export interface EvmOperatorInfo {
  operatorAddress: Address | null;
  isOperator: boolean;
  isLoading: boolean;
}

/**
 * Hook to check if the connected EVM wallet is a registered operator.
 */
const useEvmOperatorInfo = (): EvmOperatorInfo => {
  const { address } = useAccount();
  const { data: operatorMap, isLoading } = useOperatorMap();

  const result = useMemo<EvmOperatorInfo>(() => {
    if (!address || !operatorMap) {
      return {
        operatorAddress: null,
        isOperator: false,
        isLoading,
      };
    }

    // Check if the address exists in the operator map (case-insensitive)
    const normalizedAddress = address.toLowerCase();
    const isOperator = Array.from(operatorMap.keys()).some(
      (opAddr) => opAddr.toLowerCase() === normalizedAddress,
    );

    return {
      operatorAddress: isOperator ? address : null,
      isOperator,
      isLoading: false,
    };
  }, [address, operatorMap, isLoading]);

  return result;
};

export default useEvmOperatorInfo;
