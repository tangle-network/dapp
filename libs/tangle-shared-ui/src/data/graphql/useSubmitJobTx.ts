/**
 * Hook to submit a job to a service.
 */

import { useCallback, useState } from 'react';
import { usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { encodeFunctionData, type Hash } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';

export type SubmitJobStatus = 'idle' | 'pending' | 'success' | 'error';

export interface SubmitJobParams {
  serviceId: bigint;
  jobIndex: number;
  inputs: `0x${string}`; // Encoded job inputs
}

export interface UseSubmitJobTxReturn {
  submitJob: (params: SubmitJobParams) => Promise<Hash | null>;
  status: SubmitJobStatus;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook to submit a job to a running service.
 *
 * @example
 * ```tsx
 * const { submitJob, status, error } = useSubmitJobTx();
 *
 * const handleSubmit = async () => {
 *   const hash = await submitJob({
 *     serviceId: BigInt(1),
 *     jobIndex: 0,
 *     inputs: '0x...' // Encoded inputs
 *   });
 *   if (hash) {
 *     console.log('Job submitted:', hash);
 *   }
 * };
 * ```
 */
export const useSubmitJobTx = (): UseSubmitJobTxReturn => {
  const [status, setStatus] = useState<SubmitJobStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const submitJob = useCallback(
    async (params: SubmitJobParams): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        // Encode the submitJob call
        const data = encodeFunctionData({
          abi: TANGLE_ABI,
          functionName: 'submitJob',
          args: [params.serviceId, params.jobIndex, params.inputs],
        });

        // Send the transaction
        const hash = await walletClient.sendTransaction({
          to: contracts.tangle,
          data,
        });

        // Wait for confirmation
        await publicClient.waitForTransactionReceipt({ hash });

        setStatus('success');
        return hash;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to submit job');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    submitJob,
    status,
    error,
    reset,
  };
};

export default useSubmitJobTx;
