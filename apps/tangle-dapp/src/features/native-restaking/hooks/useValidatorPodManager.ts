import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { type Address, parseEther } from 'viem';
import { useCallback, useMemo } from 'react';
import { VALIDATOR_POD_MANAGER_ABI } from '../../../abi/validatorPodManager';
import type { PodOwnerInfo, OperatorInfo, Withdrawal } from '../types';

// TODO: Replace with actual deployed contract address
const VALIDATOR_POD_MANAGER_ADDRESS =
  '0x0000000000000000000000000000000000000000' as const;

export const useValidatorPodManagerAddress = () => {
  return VALIDATOR_POD_MANAGER_ADDRESS;
};

// Hook to check if user has a pod
export const useHasPod = (ownerAddress: Address | undefined) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'hasPod',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress,
    },
  });

  return { hasPod: data as boolean | undefined, isLoading, error, refetch };
};

// Hook to get pod address for an owner
export const useGetPod = (ownerAddress: Address | undefined) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'getPod',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress,
    },
  });

  return { podAddress: data as Address | undefined, isLoading, error, refetch };
};

// Hook to get owner's shares
export const usePodOwnerShares = (ownerAddress: Address | undefined) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'podOwnerShares',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress,
    },
  });

  return { shares: data as bigint | undefined, isLoading, error, refetch };
};

// Hook to get total delegated by user
export const useDelegatorTotalDelegated = (
  delegatorAddress: Address | undefined,
) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'delegatorTotalDelegated',
    args: delegatorAddress ? [delegatorAddress] : undefined,
    query: {
      enabled: !!delegatorAddress,
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
  const { data, isLoading, error, refetch } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'queuedShares',
    args: stakerAddress ? [stakerAddress] : undefined,
    query: {
      enabled: !!stakerAddress,
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
  const { data, isLoading, error, refetch } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'getAvailableToWithdraw',
    args: stakerAddress ? [stakerAddress] : undefined,
    query: {
      enabled: !!stakerAddress,
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
  const {
    data: isOperator,
    isLoading: l1,
    refetch: r1,
  } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'isOperator',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: !!operatorAddress },
  });

  const {
    data: isActive,
    isLoading: l2,
    refetch: r2,
  } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'isOperatorActive',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: !!operatorAddress },
  });

  const {
    data: selfStake,
    isLoading: l3,
    refetch: r3,
  } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'operatorStake',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: !!operatorAddress },
  });

  const {
    data: delegatedStake,
    isLoading: l4,
    refetch: r4,
  } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'operatorDelegatedStake',
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: !!operatorAddress },
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
  const { data, isLoading, error, refetch } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'getWithdrawalInfo',
    args: withdrawalRoot ? [withdrawalRoot] : undefined,
    query: {
      enabled: !!withdrawalRoot,
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
  const { data, isLoading, error } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'minOperatorStakeAmount',
  });

  return { minStake: data as bigint | undefined, isLoading, error };
};

// Hook to get withdrawal delay
export const useWithdrawalDelayBlocks = () => {
  const { data, isLoading, error } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'withdrawalDelayBlocks',
  });

  return { delayBlocks: data as number | undefined, isLoading, error };
};

// Hook to get delegation amount between delegator and operator
export const useDelegation = (
  delegatorAddress: Address | undefined,
  operatorAddress: Address | undefined,
) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: VALIDATOR_POD_MANAGER_ADDRESS,
    abi: VALIDATOR_POD_MANAGER_ABI,
    functionName: 'delegations',
    args:
      delegatorAddress && operatorAddress
        ? [delegatorAddress, operatorAddress]
        : undefined,
    query: {
      enabled: !!delegatorAddress && !!operatorAddress,
    },
  });

  return { data: data as bigint | undefined, isLoading, error, refetch };
};

// Write hooks
export const useCreatePod = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPod = useCallback(() => {
    writeContract({
      address: VALIDATOR_POD_MANAGER_ADDRESS,
      abi: VALIDATOR_POD_MANAGER_ABI,
      functionName: 'createPod',
    });
  }, [writeContract]);

  return { createPod, hash, isPending, isConfirming, isSuccess, error };
};

export const useRegisterOperator = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerOperator = useCallback(
    (stakeAmountEth: string) => {
      writeContract({
        address: VALIDATOR_POD_MANAGER_ADDRESS,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'registerOperator',
        value: parseEther(stakeAmountEth),
      });
    },
    [writeContract],
  );

  return { registerOperator, hash, isPending, isConfirming, isSuccess, error };
};

export const useDelegateTo = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const delegateTo = useCallback(
    (operator: Address, amount: bigint) => {
      writeContract({
        address: VALIDATOR_POD_MANAGER_ADDRESS,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'delegateTo',
        args: [operator, amount],
      });
    },
    [writeContract],
  );

  return { delegateTo, hash, isPending, isConfirming, isSuccess, error };
};

export const useUndelegateFrom = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const undelegateFrom = useCallback(
    (operator: Address, amount: bigint) => {
      writeContract({
        address: VALIDATOR_POD_MANAGER_ADDRESS,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'undelegateFrom',
        args: [operator, amount],
      });
    },
    [writeContract],
  );

  return { undelegateFrom, hash, isPending, isConfirming, isSuccess, error };
};

export const useQueueWithdrawal = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const queueWithdrawal = useCallback(
    (shares: bigint) => {
      writeContract({
        address: VALIDATOR_POD_MANAGER_ADDRESS,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'queueWithdrawal',
        args: [shares],
      });
    },
    [writeContract],
  );

  return { queueWithdrawal, hash, isPending, isConfirming, isSuccess, error };
};

export const useCompleteWithdrawal = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const completeWithdrawal = useCallback(
    (withdrawalRoot: `0x${string}`) => {
      writeContract({
        address: VALIDATOR_POD_MANAGER_ADDRESS,
        abi: VALIDATOR_POD_MANAGER_ABI,
        functionName: 'completeWithdrawal',
        args: [withdrawalRoot],
      });
    },
    [writeContract],
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
