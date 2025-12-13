import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import CREDITS_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/credits';
import EVMChainId from '@tangle-network/dapp-types/EVMChainId';
import { useChainId } from 'wagmi';

// This represents the structure of our credits data
export type CreditsData = {
  amount: bigint;
};

const CREDITS_SUPPORTED_EVM_CHAIN_IDS = new Set<number>([
  EVMChainId.TangleLocalEVM,
  EVMChainId.TangleTestnetEVM,
  EVMChainId.TangleMainnetEVM,
]);

export default function useCredits() {
  const activeEvmAddress = useEvmAddress();
  const chainId = useChainId();
  const isSupportedNetwork = CREDITS_SUPPORTED_EVM_CHAIN_IDS.has(chainId);

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
      enabled: activeEvmAddress !== null && isSupportedNetwork,
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
    isSupportedNetwork,
    isError: isSupportedNetwork ? isError : false,
    error: isSupportedNetwork ? error : null,
    refetch,
  };
}
