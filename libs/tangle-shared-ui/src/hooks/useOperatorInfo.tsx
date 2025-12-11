import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useOperators } from '../data/graphql/useOperators';
import type { Address } from 'viem';

type UseOperatorInfo = {
  operatorAddress: Address | null;
  isOperator: boolean;
  isLoading: boolean;
};

const useOperatorInfo = (): UseOperatorInfo => {
  const { address } = useAccount();
  const { data: operators, isLoading } = useOperators();

  const result = useMemo(() => {
    if (!address || !operators) {
      return {
        operatorAddress: null,
        isOperator: false,
        isLoading,
      };
    }

    // Check if the connected address is in the operators list
    const isOperator = operators.some(
      (op) => op.id.toLowerCase() === address.toLowerCase(),
    );

    return {
      operatorAddress: isOperator ? address : null,
      isOperator,
      isLoading,
    };
  }, [address, operators, isLoading]);

  return result;
};

export default useOperatorInfo;
