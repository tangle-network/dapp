import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { type Address } from 'viem';
import { useCallback, useMemo } from 'react';
import { VALIDATOR_POD_ABI } from '../../../abi/validatorPod';
import type {
  PodInfo,
  Checkpoint,
  ValidatorInfo,
  ValidatorStatus,
  CredentialProofBundle,
  CheckpointProofBundle,
} from '../types';

// Hook to get pod info
export const usePodInfo = (
  podAddress: Address | undefined,
): {
  data: PodInfo | null;
  isLoading: boolean;
  refetch: () => void;
} => {
  const {
    data: podOwner,
    isLoading: l1,
    refetch: r1,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'podOwner',
    query: { enabled: !!podAddress },
  });

  const {
    data: hasRestaked,
    isLoading: l2,
    refetch: r2,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'hasRestaked',
    query: { enabled: !!podAddress },
  });

  const {
    data: activeValidatorCount,
    isLoading: l3,
    refetch: r3,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'activeValidatorCount',
    query: { enabled: !!podAddress },
  });

  const {
    data: totalRestakedBalanceGwei,
    isLoading: l4,
    refetch: r4,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'totalRestakedBalanceGwei',
    query: { enabled: !!podAddress },
  });

  const {
    data: beaconChainSlashingFactor,
    isLoading: l5,
    refetch: r5,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'beaconChainSlashingFactor',
    query: { enabled: !!podAddress },
  });

  const {
    data: proofSubmitter,
    isLoading: l6,
    refetch: r6,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'proofSubmitter',
    query: { enabled: !!podAddress },
  });

  const {
    data: withdrawalCredentials,
    isLoading: l7,
    refetch: r7,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'podWithdrawalCredentials',
    query: { enabled: !!podAddress },
  });

  const {
    data: currentCheckpointTimestamp,
    isLoading: l8,
    refetch: r8,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'currentCheckpointTimestamp',
    query: { enabled: !!podAddress },
  });

  const {
    data: lastCompletedCheckpointTimestamp,
    isLoading: l9,
    refetch: r9,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'lastCompletedCheckpointTimestamp',
    query: { enabled: !!podAddress },
  });

  const {
    data: checkpointActive,
    isLoading: l10,
    refetch: r10,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'checkpointActive',
    query: { enabled: !!podAddress },
  });

  const {
    data: currentCheckpoint,
    isLoading: l11,
    refetch: r11,
  } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'currentCheckpoint',
    query: { enabled: !!podAddress },
  });

  const isLoading =
    l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9 || l10 || l11;

  const data = useMemo((): PodInfo | null => {
    if (!podAddress || podOwner === undefined) return null;

    let checkpoint: Checkpoint | null = null;
    if (currentCheckpoint && checkpointActive) {
      const [
        beaconBlockRoot,
        proofsRemaining,
        podBalanceGwei,
        balanceDeltasGwei,
        priorBeaconBalanceGwei,
      ] = currentCheckpoint as [`0x${string}`, number, bigint, bigint, bigint];
      checkpoint = {
        beaconBlockRoot,
        proofsRemaining,
        podBalanceGwei,
        balanceDeltasGwei,
        priorBeaconBalanceGwei,
      };
    }

    return {
      address: podAddress,
      owner: podOwner as Address,
      hasRestaked: (hasRestaked as boolean) ?? false,
      activeValidatorCount: Number(activeValidatorCount ?? BigInt(0)),
      totalRestakedBalanceGwei:
        (totalRestakedBalanceGwei as bigint) ?? BigInt(0),
      beaconChainSlashingFactor:
        (beaconChainSlashingFactor as bigint) ?? BigInt(0),
      proofSubmitter:
        proofSubmitter &&
        proofSubmitter !== '0x0000000000000000000000000000000000000000'
          ? (proofSubmitter as Address)
          : null,
      withdrawalCredentials: (withdrawalCredentials as `0x${string}`) ?? '0x',
      currentCheckpointTimestamp:
        (currentCheckpointTimestamp as bigint) ?? BigInt(0),
      lastCompletedCheckpointTimestamp:
        (lastCompletedCheckpointTimestamp as bigint) ?? BigInt(0),
      checkpointActive: (checkpointActive as boolean) ?? false,
      currentCheckpoint: checkpoint,
    };
  }, [
    podAddress,
    podOwner,
    hasRestaked,
    activeValidatorCount,
    totalRestakedBalanceGwei,
    beaconChainSlashingFactor,
    proofSubmitter,
    withdrawalCredentials,
    currentCheckpointTimestamp,
    lastCompletedCheckpointTimestamp,
    checkpointActive,
    currentCheckpoint,
  ]);

  const refetch = useCallback(() => {
    r1();
    r2();
    r3();
    r4();
    r5();
    r6();
    r7();
    r8();
    r9();
    r10();
    r11();
  }, [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11]);

  return { data, isLoading, refetch };
};

// Hook to get validator info by pubkey hash
export const useValidatorInfo = (
  podAddress: Address | undefined,
  pubkeyHash: `0x${string}` | undefined,
): {
  data: ValidatorInfo | null;
  isLoading: boolean;
  refetch: () => void;
} => {
  const { data, isLoading, refetch } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'validatorInfo',
    args: pubkeyHash ? [pubkeyHash] : undefined,
    query: { enabled: !!podAddress && !!pubkeyHash },
  });

  const validatorInfo = useMemo((): ValidatorInfo | null => {
    if (!data || !pubkeyHash) return null;
    const [validatorIndex, restakedBalanceGwei, lastCheckpointedAt, status] =
      data as [number, bigint, bigint, number];
    return {
      validatorIndex,
      restakedBalanceGwei,
      lastCheckpointedAt,
      status: status as ValidatorStatus,
      pubkeyHash,
    };
  }, [data, pubkeyHash]);

  return { data: validatorInfo, isLoading, refetch };
};

// Hook to get slashing factor
export const useSlashingFactor = (podAddress: Address | undefined) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: podAddress,
    abi: VALIDATOR_POD_ABI,
    functionName: 'getSlashingFactor',
    query: { enabled: !!podAddress },
  });

  return {
    slashingFactor: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
};

// Write hooks for ValidatorPod

export const useVerifyWithdrawalCredentials = (
  podAddress: Address | undefined,
) => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const verifyWithdrawalCredentials = useCallback(
    (proofBundle: CredentialProofBundle) => {
      if (!podAddress) return;

      writeContract({
        address: podAddress,
        abi: VALIDATOR_POD_ABI,
        functionName: 'verifyWithdrawalCredentials',
        args: [
          proofBundle.beaconTimestamp,
          proofBundle.stateRootProof as {
            beaconStateRoot: `0x${string}`;
            proof: `0x${string}`;
          },
          proofBundle.validatorIndices,
          proofBundle.validatorFieldsProofs,
          proofBundle.validatorFields,
        ] as const,
      });
    },
    [podAddress, writeContract],
  );

  return {
    verifyWithdrawalCredentials,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

export const useStartCheckpoint = (podAddress: Address | undefined) => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const startCheckpoint = useCallback(
    (revertIfNoBalance = false) => {
      if (!podAddress) return;

      writeContract({
        address: podAddress,
        abi: VALIDATOR_POD_ABI,
        functionName: 'startCheckpoint',
        args: [revertIfNoBalance],
      });
    },
    [podAddress, writeContract],
  );

  return { startCheckpoint, hash, isPending, isConfirming, isSuccess, error };
};

export const useVerifyCheckpointProofs = (podAddress: Address | undefined) => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const verifyCheckpointProofs = useCallback(
    (proofBundle: CheckpointProofBundle) => {
      if (!podAddress) return;

      writeContract({
        address: podAddress,
        abi: VALIDATOR_POD_ABI,
        functionName: 'verifyCheckpointProofs',
        args: [
          proofBundle.stateRootProof as {
            beaconStateRoot: `0x${string}`;
            proof: `0x${string}`;
          },
          proofBundle.balanceContainerProof as {
            balanceContainerRoot: `0x${string}`;
            proof: `0x${string}`;
          },
          proofBundle.proofs as readonly {
            pubkeyHash: `0x${string}`;
            balanceRoot: `0x${string}`;
            proof: `0x${string}`;
          }[],
        ] as const,
      });
    },
    [podAddress, writeContract],
  );

  return {
    verifyCheckpointProofs,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

export const useSetProofSubmitter = (podAddress: Address | undefined) => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setProofSubmitter = useCallback(
    (newProofSubmitter: Address) => {
      if (!podAddress) return;

      writeContract({
        address: podAddress,
        abi: VALIDATOR_POD_ABI,
        functionName: 'setProofSubmitter',
        args: [newProofSubmitter],
      });
    },
    [podAddress, writeContract],
  );

  return { setProofSubmitter, hash, isPending, isConfirming, isSuccess, error };
};

export const useWithdrawNonBeaconChainEth = (
  podAddress: Address | undefined,
) => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdrawNonBeaconChainEth = useCallback(
    (recipient: Address, amount: bigint) => {
      if (!podAddress) return;

      writeContract({
        address: podAddress,
        abi: VALIDATOR_POD_ABI,
        functionName: 'withdrawNonBeaconChainEth',
        args: [recipient, amount],
      });
    },
    [podAddress, writeContract],
  );

  return {
    withdrawNonBeaconChainEth,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};
