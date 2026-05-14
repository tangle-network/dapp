import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { type Address, parseEther } from 'viem';
import { useCallback, useMemo } from 'react';
import { VALIDATOR_POD_MANAGER_ABI } from '../../../abi/validatorPodManager';
import type { PodOwnerInfo, OperatorInfo, Withdrawal } from '../types';

// Contract addresses by chain ID
// Mainnet/testnet addresses are intentionally omitted until those deployments are finalized.
const VALIDATOR_POD_MANAGER_ADDRESSES: Record<number, Address> = {
  // 1: '0x...', // Ethereum Mainnet - not deployed yet
  // 17000: '0x...', // Holesky Testnet - not deployed yet
  31337: '0x07882Ae1ecB7429a84f1D53048d35c4bB2056877', // Local (Anvil)
};

// Helper to check if contracts are deployed
export const isNativeStakingDeployed = (chainId: number): boolean => {
  return chainId in VALIDATOR_POD_MANAGER_ADDRESSES;
};

export const getValidatorPodManagerAddress = (
  chainId: number,
): Address | null => {
  return VALIDATOR_POD_MANAGER_ADDRESSES[chainId] ?? null;
};

// Helper hook for getting contract address with chain awareness
const useContractAddress = () => {
  const chainId = useChainId();
  return getValidatorPodManagerAddress(chainId);
};

export const useValidatorPodManagerAddress = () => {
  const chainId = useChainId();
  return getValidatorPodManagerAddress(chainId);
};

// Hook to check if user has a pod
export const useHasPod = (ownerAddress: Address | undefined) => {
  const chainId = useChainId();
  const contractAddress = getValidatorPodManagerAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'hasPod',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress && !!contractAddress,
    },
  });

  return {
    hasPod: data as boolean | undefined,
    isLoading: contractAddress ? isLoading : false,
    error,
    refetch,
    isDeployed: !!contractAddress,
  };
};

// Hook to get pod address for an owner
export const useGetPod = (ownerAddress: Address | undefined) => {
  const chainId = useChainId();
  const contractAddress = getValidatorPodManagerAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'getPod',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress && !!contractAddress,
    },
  });

  return {
    podAddress: data as Address | undefined,
    isLoading: contractAddress ? isLoading : false,
    error,
    refetch,
    isDeployed: !!contractAddress,
  };
};

// Hook to get owner's shares.
// tnt-core v0.15.0: legacy `podOwnerShares` was removed during the share-pool
// refactor. `getShares` returns int256 (can be negative if a beacon rebase
// pushed the owner under their previous share count); UI keeps the bigint
// shape and downstream renderers already clamp at zero where needed.
export const usePodOwnerShares = (ownerAddress: Address | undefined) => {
  const chainId = useChainId();
  const contractAddress = getValidatorPodManagerAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'getShares',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress && !!contractAddress,
    },
  });

  return { shares: data as bigint | undefined, isLoading, error, refetch };
};

// Hook to get total delegated by user
export const useDelegatorTotalDelegated = (
  delegatorAddress: Address | undefined,
) => {
  const chainId = useChainId();
  const contractAddress = getValidatorPodManagerAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'delegatorTotalDelegated',
    args: delegatorAddress ? [delegatorAddress] : undefined,
    query: {
      enabled: !!delegatorAddress && !!contractAddress,
    },
  });

  return {
    totalDelegated: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
};

// Hook to get queued shares
export const useQueuedShares = (stakerAddress: Address | undefined) => {
  const chainId = useChainId();
  const contractAddress = getValidatorPodManagerAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'queuedShares',
    args: stakerAddress ? [stakerAddress] : undefined,
    query: {
      enabled: !!stakerAddress && !!contractAddress,
    },
  });

  return {
    queuedShares: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
};

// Hook to get available to withdraw
export const useAvailableToWithdraw = (stakerAddress: Address | undefined) => {
  const chainId = useChainId();
  const contractAddress = getValidatorPodManagerAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'getAvailableToWithdraw',
    args: stakerAddress ? [stakerAddress] : undefined,
    query: {
      enabled: !!stakerAddress && !!contractAddress,
    },
  });

  return {
    availableToWithdraw: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
};

// Combined hook to get all pod owner info
export const usePodOwnerInfo = (
  ownerAddress: Address | undefined,
): {
  data: PodOwnerInfo | null;
  isLoading: boolean;
  refetch: () => void;
} => {
  const {
    hasPod,
    isLoading: loadingHasPod,
    refetch: refetchHasPod,
  } = useHasPod(ownerAddress);
  const {
    podAddress,
    isLoading: loadingPod,
    refetch: refetchPod,
  } = useGetPod(ownerAddress);
  const {
    shares,
    isLoading: loadingShares,
    refetch: refetchShares,
  } = usePodOwnerShares(ownerAddress);
  const {
    totalDelegated,
    isLoading: loadingDelegated,
    refetch: refetchDelegated,
  } = useDelegatorTotalDelegated(ownerAddress);
  const {
    queuedShares,
    isLoading: loadingQueued,
    refetch: refetchQueued,
  } = useQueuedShares(ownerAddress);
  const {
    availableToWithdraw,
    isLoading: loadingAvailable,
    refetch: refetchAvailable,
  } = useAvailableToWithdraw(ownerAddress);

  const isLoading =
    loadingHasPod ||
    loadingPod ||
    loadingShares ||
    loadingDelegated ||
    loadingQueued ||
    loadingAvailable;

  const data = useMemo((): PodOwnerInfo | null => {
    if (!ownerAddress || hasPod === undefined) return null;

    return {
      hasPod: hasPod ?? false,
      podAddress: podAddress ?? null,
      shares: shares ?? BigInt(0),
      totalDelegated: totalDelegated ?? BigInt(0),
      queuedShares: queuedShares ?? BigInt(0),
      availableToWithdraw: availableToWithdraw ?? BigInt(0),
    };
  }, [
    ownerAddress,
    hasPod,
    podAddress,
    shares,
    totalDelegated,
    queuedShares,
    availableToWithdraw,
  ]);

  const refetch = useCallback(() => {
    refetchHasPod();
    refetchPod();
    refetchShares();
    refetchDelegated();
    refetchQueued();
    refetchAvailable();
  }, [
    refetchHasPod,
    refetchPod,
    refetchShares,
    refetchDelegated,
    refetchQueued,
    refetchAvailable,
  ]);

  return { data, isLoading, refetch };
};

// Hook to get operator info
export const useOperatorInfo = (
  operatorAddress: Address | undefined,
): {
  data: OperatorInfo | null;
  isLoading: boolean;
  refetch: () => void;
} => {
  const contractAddress = useContractAddress();

  const {
    data: isOperator,
    isLoading: l1,
    refetch: r1,
  } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'isOperator',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: !!operatorAddress && !!contractAddress },
  });

  const {
    data: isActive,
    isLoading: l2,
    refetch: r2,
  } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'isOperatorActive',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: !!operatorAddress && !!contractAddress },
  });

  const {
    data: selfStake,
    isLoading: l3,
    refetch: r3,
  } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'operatorStake',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: !!operatorAddress && !!contractAddress },
  });

  const {
    data: delegatedStake,
    isLoading: l4,
    refetch: r4,
  } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'operatorDelegatedStake',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: !!operatorAddress && !!contractAddress },
  });

  const isLoading = l1 || l2 || l3 || l4;

  const data = useMemo((): OperatorInfo | null => {
    if (!operatorAddress) return null;

    return {
      address: operatorAddress,
      isOperator: (isOperator as boolean) ?? false,
      isActive: (isActive as boolean) ?? false,
      selfStake: (selfStake as bigint) ?? BigInt(0),
      delegatedStake: (delegatedStake as bigint) ?? BigInt(0),
      totalStake:
        ((selfStake as bigint) ?? BigInt(0)) +
        ((delegatedStake as bigint) ?? BigInt(0)),
    };
  }, [operatorAddress, isOperator, isActive, selfStake, delegatedStake]);

  const refetch = useCallback(() => {
    r1();
    r2();
    r3();
    r4();
  }, [r1, r2, r3, r4]);

  return { data, isLoading, refetch };
};

// Hook to get withdrawal info
export const useWithdrawalInfo = (
  withdrawalRoot: `0x${string}` | undefined,
) => {
  const contractAddress = useContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'getWithdrawalInfo',
    args: withdrawalRoot ? [withdrawalRoot] : undefined,
    query: {
      enabled: !!withdrawalRoot && !!contractAddress,
    },
  });

  const withdrawal = useMemo((): Withdrawal | null => {
    if (!data || !withdrawalRoot) return null;
    const [staker, shares, startBlock, completed, canComplete] = data as [
      Address,
      bigint,
      number,
      boolean,
      boolean,
    ];
    return {
      withdrawalRoot,
      staker,
      shares,
      startBlock,
      completed,
      canComplete,
    };
  }, [data, withdrawalRoot]);

  return { withdrawal, isLoading, error, refetch };
};

// Hook to get min operator stake
export const useMinOperatorStake = () => {
  const contractAddress = useContractAddress();

  const { data, isLoading, error } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'minOperatorStakeAmount',
    query: { enabled: !!contractAddress },
  });

  return { minStake: data as bigint | undefined, isLoading, error };
};

// Hook to get withdrawal delay
export const useWithdrawalDelayBlocks = () => {
  const contractAddress = useContractAddress();

  const { data, isLoading, error } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'withdrawalDelayBlocks',
    query: { enabled: !!contractAddress },
  });

  return { delayBlocks: data as number | undefined, isLoading, error };
};

// Hook to get delegation amount between delegator and operator
export const useDelegation = (
  delegatorAddress: Address | undefined,
  operatorAddress: Address | undefined,
) => {
  const contractAddress = useContractAddress();

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress ?? undefined,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'delegations',
    args:
      delegatorAddress && operatorAddress
        ? [delegatorAddress, operatorAddress]
        : undefined,
    query: {
      enabled: !!delegatorAddress && !!operatorAddress && !!contractAddress,
    },
  });

  return { data: data as bigint | undefined, isLoading, error, refetch };
};

// Write hooks
export const useCreatePod = () => {
  const contractAddress = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPod = useCallback(() => {
    if (!contractAddress) return;
    writeContract({
      address: contractAddress,
      abi: VALIDATOR_POD_MANAGER_ABI,
      functionName: 'createPod',
    });
  }, [writeContract, contractAddress]);

  return { createPod, hash, isPending, isConfirming, isSuccess, error };
};

export const useRegisterOperator = () => {
  const contractAddress = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerOperator = useCallback(
    (stakeAmountEth: string) => {
      if (!contractAddress) return;
      writeContract({
        address: contractAddress,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'registerOperator',
        value: parseEther(stakeAmountEth),
      });
    },
    [writeContract, contractAddress],
  );

  return { registerOperator, hash, isPending, isConfirming, isSuccess, error };
};

export const useDelegateTo = () => {
  const contractAddress = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const delegateTo = useCallback(
    (operator: Address, amount: bigint) => {
      if (!contractAddress) return;
      writeContract({
        address: contractAddress,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'delegateTo',
        args: [operator, amount],
      });
    },
    [writeContract, contractAddress],
  );

  return { delegateTo, hash, isPending, isConfirming, isSuccess, error };
};

export const useUndelegateFrom = () => {
  const contractAddress = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const undelegateFrom = useCallback(
    (operator: Address, amount: bigint) => {
      if (!contractAddress) return;
      writeContract({
        address: contractAddress,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'undelegateFrom',
        args: [operator, amount],
      });
    },
    [writeContract, contractAddress],
  );

  return { undelegateFrom, hash, isPending, isConfirming, isSuccess, error };
};

export const useQueueWithdrawal = () => {
  const contractAddress = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const queueWithdrawal = useCallback(
    (shares: bigint) => {
      if (!contractAddress) return;
      writeContract({
        address: contractAddress,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'queueWithdrawal',
        args: [shares],
      });
    },
    [writeContract, contractAddress],
  );

  return { queueWithdrawal, hash, isPending, isConfirming, isSuccess, error };
};

export const useCompleteWithdrawal = () => {
  const contractAddress = useContractAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const completeWithdrawal = useCallback(
    (withdrawalRoot: `0x${string}`) => {
      if (!contractAddress) return;
      writeContract({
        address: contractAddress,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'completeWithdrawal',
        args: [withdrawalRoot],
      });
    },
    [writeContract, contractAddress],
  );

  return {
    completeWithdrawal,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};
