/**
 * Hook to submit a job to a service.
 *
 * For native token payments, include the `value` parameter.
 * For ERC20 payments, ensure approval is done first (use useErc20Approval hook).
 */

import { useQueryClient } from '@tanstack/react-query';
import { useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import useContractWrite, {
  TxStatus,
} from '../../hooks/useContractWrite';
import TANGLE_ABI from '../../abi/tangle';

export type SubmitJobStatus = 'idle' | 'pending' | 'success' | 'error';

export interface SubmitJobParams {
  serviceId: bigint;
  jobIndex: number;
  inputs: `0x${string}`;
  /** Payment amount for native token (ETH). Set this when isNativeToken is true */
  value?: bigint;
}

export const useSubmitJobTx = () => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = chainId ? getContractsByChainId(chainId) : null;
  } catch {
    contracts = null;
  }

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: SubmitJobParams, _activeAddress) => {
      if (!contracts) return null;

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'submitJob' as const,
        args: [params.serviceId, params.jobIndex, params.inputs] as const,
        value: params.value,
      };
    },
    {
      txName: 'submit job',
      txDetails: (params) =>
        new Map([
          ['Service ID', params.serviceId.toString()],
          ['Job Index', params.jobIndex.toString()],
        ]),
      getSuccessMessage: (params) =>
        `Job submitted to service #${params.serviceId}`,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
        queryClient.invalidateQueries({ queryKey: ['jobCalls'] });
        queryClient.invalidateQueries({ queryKey: ['serviceEscrow'] });
        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ['jobs'] });
        }, 2_000);
      },
    },
  );

  // Map useContractWrite status to the existing SubmitJobStatus interface
  const status: SubmitJobStatus =
    hook.status === TxStatus.PROCESSING
      ? 'pending'
      : hook.status === TxStatus.COMPLETE
        ? 'success'
        : hook.status === TxStatus.ERROR
          ? 'error'
          : 'idle';

  return {
    submitJob: hook.execute,
    status,
    error: hook.error,
    reset: hook.reset,
  };
};

export default useSubmitJobTx;
