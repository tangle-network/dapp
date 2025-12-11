import { useCallback } from 'react';
import { type Hex } from 'viem';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

/**
 * TangleMigration contract address (to be set after deployment)
 */
const TANGLE_MIGRATION_ADDRESS =
  (import.meta.env.VITE_TANGLE_MIGRATION_ADDRESS as Hex) || null;

// TangleMigration contract ABI (claimWithZKProof function)
const TANGLE_MIGRATION_ABI = [
  {
    name: 'claimWithZKProof',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'originalAddress', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'merkleProof', type: 'bytes32[]' },
      { name: 'zkProof', type: 'bytes' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [],
  },
] as const;

export interface ClaimArgs {
  /** The SS58 Substrate address */
  ss58Address: string;
  /** The amount to claim */
  amount: bigint;
  /** The Merkle proof */
  merkleProof: Hex[];
  /** The ZK proof bytes (SP1 proof) */
  zkProof: Hex;
  /** The recipient EVM address */
  recipient: Hex;
}

/**
 * Hook for submitting migration claims on-chain using TangleMigration contract
 */
const useSubmitClaim = () => {
  const { address: userAddress } = useAccount();

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  /**
   * Submit a claim transaction using claimWithZKProof
   */
  const submitClaim = useCallback(
    async (args: ClaimArgs) => {
      if (!TANGLE_MIGRATION_ADDRESS) {
        throw new Error('TangleMigration contract not configured');
      }

      if (!userAddress) {
        throw new Error('Wallet not connected');
      }

      writeContract({
        address: TANGLE_MIGRATION_ADDRESS,
        abi: TANGLE_MIGRATION_ABI,
        functionName: 'claimWithZKProof',
        args: [
          args.ss58Address,
          args.amount,
          args.merkleProof,
          args.zkProof,
          args.recipient,
        ],
      });
    },
    [userAddress, writeContract],
  );

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    resetWrite();
  }, [resetWrite]);

  return {
    submitClaim,
    reset,
    txHash,
    isSubmitting: isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
    contractConfigured: !!TANGLE_MIGRATION_ADDRESS,
  };
};

export default useSubmitClaim;
