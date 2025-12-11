import { useCallback, useEffect } from 'react';
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

  // Log state changes for debugging
  useEffect(() => {
    if (writeError) {
      console.error('[useSubmitClaim] Write error:', writeError);
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      console.error('[useSubmitClaim] Confirm error:', confirmError);
    }
  }, [confirmError]);

  useEffect(() => {
    if (txHash) {
      console.log('[useSubmitClaim] Transaction submitted:', txHash);
    }
  }, [txHash]);

  useEffect(() => {
    if (isConfirmed) {
      console.log('[useSubmitClaim] Transaction confirmed!');
    }
  }, [isConfirmed]);

  /**
   * Submit a claim transaction using claimWithZKProof
   */
  const submitClaim = useCallback(
    async (args: ClaimArgs) => {
      console.log('[useSubmitClaim] Starting claim submission...');
      console.log(
        '[useSubmitClaim] Contract address:',
        TANGLE_MIGRATION_ADDRESS,
      );
      console.log('[useSubmitClaim] Args:', {
        ss58Address: args.ss58Address,
        amount: args.amount.toString(),
        merkleProofLength: args.merkleProof.length,
        zkProofLength: args.zkProof.length,
        recipient: args.recipient,
      });

      if (!TANGLE_MIGRATION_ADDRESS) {
        console.error('[useSubmitClaim] Contract not configured');
        throw new Error('TangleMigration contract not configured');
      }

      if (!userAddress) {
        console.error('[useSubmitClaim] Wallet not connected');
        throw new Error('Wallet not connected');
      }

      try {
        console.log('[useSubmitClaim] Calling writeContract...');
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
        console.log(
          '[useSubmitClaim] writeContract called (check wallet for prompt)',
        );
      } catch (err) {
        console.error('[useSubmitClaim] writeContract error:', err);
        throw err;
      }
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
