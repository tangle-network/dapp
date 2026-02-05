/**
 * Hook to submit a job to a service.
 */

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { encodeFunctionData, type Hash } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';

export type SubmitJobStatus = 'idle' | 'pending' | 'success' | 'error';

export interface SubmitJobParams {
  serviceId: bigint;
  jobIndex: number;
  inputs: `0x${string}`;
  /** Payment amount for native token (ETH). Set this when isNativeToken is true */
  value?: bigint;
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
 * For native token payments, include the `value` parameter.
 * For ERC20 payments, ensure approval is done first (use useErc20Approval hook).
 */
export const useSubmitJobTx = (): UseSubmitJobTxReturn => {
  const [status, setStatus] = useState<SubmitJobStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

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

        // Send the transaction with optional value for native token payments
        const hash = await walletClient.sendTransaction({
          to: contracts.tangle,
          data,
          value: params.value,
        });

        // Wait for confirmation
        await publicClient.waitForTransactionReceipt({ hash });

        // Invalidate job-related queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['jobCalls'] });
        queryClient.invalidateQueries({ queryKey: ['serviceEscrow'] });

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
    [chainId, publicClient, walletClient, queryClient],
  );

  return {
    submitJob,
    status,
    error,
    reset,
  };
};

export default useSubmitJobTx;
