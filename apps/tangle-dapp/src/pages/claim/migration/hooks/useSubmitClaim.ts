import { useCallback, useEffect, useState } from 'react';
import { type Hex } from 'viem';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

type SubmissionMode = 'relayer' | 'wallet';

/**
 * TangleMigration contract address (to be set after deployment)
 */
const TANGLE_MIGRATION_ADDRESS =
  (import.meta.env.VITE_TANGLE_MIGRATION_ADDRESS as Hex) || null;
const CLAIM_RELAYER_URL =
  (import.meta.env.VITE_CLAIM_RELAYER_URL as string | undefined)?.replace(
    /\/$/,
    '',
  ) || null;

// TangleMigration contract ABI (claimWithZKProof function)
const TANGLE_MIGRATION_ABI = [
  {
    name: 'claimWithZKProof',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'pubkey', type: 'bytes32' },
      { name: 'amount', type: 'uint256' },
      { name: 'merkleProof', type: 'bytes32[]' },
      { name: 'zkProof', type: 'bytes' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [],
  },
  // Errors (for decoding revert reasons)
  { name: 'ClaimsPaused', type: 'error', inputs: [] },
  { name: 'ClaimDeadlinePassed', type: 'error', inputs: [] },
  { name: 'InvalidMerkleProof', type: 'error', inputs: [] },
  { name: 'InvalidZKProof', type: 'error', inputs: [] },
  { name: 'AlreadyClaimed', type: 'error', inputs: [] },
  { name: 'ZeroAmount', type: 'error', inputs: [] },
  { name: 'ZeroAddress', type: 'error', inputs: [] },
  { name: 'NoZKVerifier', type: 'error', inputs: [] },
] as const;

export interface ClaimArgs {
  /** The SS58 Substrate address */
  ss58Address: string;
  /** 32-byte pubkey derived from SS58 */
  pubkey: Hex;
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
  const defaultSubmissionMode: SubmissionMode = CLAIM_RELAYER_URL
    ? 'relayer'
    : 'wallet';
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>(
    defaultSubmissionMode,
  );
  const [relayerTxHash, setRelayerTxHash] = useState<Hex | null>(null);
  const [relayerError, setRelayerError] = useState<Error | null>(null);
  const [isRelayerSubmitting, setIsRelayerSubmitting] = useState(false);
  const [relayerSuccess, setRelayerSuccess] = useState(false);

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

      if (!CLAIM_RELAYER_URL && !userAddress) {
        console.error('[useSubmitClaim] Wallet not connected');
        throw new Error('Wallet not connected');
      }

      if (CLAIM_RELAYER_URL && submissionMode === 'relayer') {
        setIsRelayerSubmitting(true);
        setRelayerError(null);
        setRelayerTxHash(null);
        setRelayerSuccess(false);
        try {
          const response = await fetch(`${CLAIM_RELAYER_URL}/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pubkey: args.pubkey,
              amount: args.amount.toString(),
              merkleProof: args.merkleProof,
              zkProof: args.zkProof,
              recipient: args.recipient,
            }),
          });

          if (!response.ok) {
            const errorPayload = await response.json().catch(() => ({}));
            const message =
              (errorPayload as { message?: string }).message ||
              'Relayer request failed';
            throw new Error(message);
          }

          const json = (await response.json()) as {
            txHash?: Hex;
          };

          if (json.txHash) {
            setRelayerTxHash(json.txHash);
          }
          setRelayerSuccess(true);
          console.log('[useSubmitClaim] Relayer submission complete');
          return;
        } catch (err) {
          const isNetworkError =
            err instanceof TypeError &&
            /failed to fetch|networkerror|load failed|fetch/i.test(err.message);

          if (isNetworkError && userAddress) {
            console.warn(
              '[useSubmitClaim] Relayer request failed; falling back to direct wallet submission.',
            );
            setSubmissionMode('wallet');
          } else if (isNetworkError) {
            const isMixedContent =
              typeof window !== 'undefined' &&
              window.location.protocol === 'https:' &&
              CLAIM_RELAYER_URL.startsWith('http://');
            throw new Error(
              isMixedContent
                ? `Claim relayer blocked by the browser (mixed content): ${CLAIM_RELAYER_URL}`
                : `Claim relayer unreachable: ${CLAIM_RELAYER_URL}`,
            );
          } else {
            const error =
              err instanceof Error ? err : new Error(String(err ?? 'Error'));
            setRelayerError(error);
            console.error('[useSubmitClaim] Relayer error:', error);
            throw error;
          }
        } finally {
          setIsRelayerSubmitting(false);
        }
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
            args.pubkey,
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
    [submissionMode, userAddress, writeContract],
  );

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    resetWrite();
    setRelayerTxHash(null);
    setRelayerError(null);
    setRelayerSuccess(false);
    setIsRelayerSubmitting(false);
    setSubmissionMode(defaultSubmissionMode);
  }, [defaultSubmissionMode, resetWrite]);

  const isRelayerMode = submissionMode === 'relayer' && !!CLAIM_RELAYER_URL;
  const txHashCombined = isRelayerMode
    ? (relayerTxHash ?? null)
    : (txHash ?? null);
  const isSubmittingCombined = isRelayerMode
    ? isRelayerSubmitting
    : isWritePending;
  const isConfirmingCombined = isRelayerMode ? false : isConfirming;
  const isConfirmedCombined = isRelayerMode ? relayerSuccess : isConfirmed;
  const errorCombined = isRelayerMode
    ? relayerError
    : writeError || confirmError;

  return {
    submitClaim,
    reset,
    txHash: txHashCombined,
    isSubmitting: isSubmittingCombined,
    isConfirming: isConfirmingCombined,
    isConfirmed: isConfirmedCombined,
    error: errorCombined,
    contractConfigured: !!TANGLE_MIGRATION_ADDRESS,
  };
};

export default useSubmitClaim;
