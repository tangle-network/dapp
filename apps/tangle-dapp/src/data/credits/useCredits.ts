import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import CREDITS_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/credits';

// This represents the structure of our credits data
export type CreditsData = {
  amount: bigint;
};

export default function useCredits() {
  const activeEvmAddress = useEvmAddress();

  const {
    data: creditsAmount,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: PrecompileAddress.CREDITS,
    abi: CREDITS_PRECOMPILE_ABI,
    functionName: 'query_credits',
    args: activeEvmAddress ? [activeEvmAddress] : undefined,
    query: {
      enabled: activeEvmAddress !== null,
      refetchInterval: 6000, // Refetch every 6 seconds
    },
  });

  const data = useMemo<CreditsData | null>(() => {
    if (creditsAmount === undefined) {
      return null;
    }

    return {
      amount: creditsAmount,
    };
  }, [creditsAmount]);

  return {
    data,
    isPending: isLoading,
    isError,
    error,
    refetch,
  };
}
