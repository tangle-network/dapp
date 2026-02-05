/**
 * EVM hook for joining a service with security commitments via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';
import { Address } from 'viem';
import { AssetKind } from '@tangle-network/tangle-shared-ui/data/services';

export { TxStatus };

export interface AssetSecurityCommitment {
  asset: {
    kind: AssetKind;
    token: Address;
  };
  exposureBps: number;
}

export interface JoinServiceWithCommitmentsParams {
  serviceId: bigint;
  exposureBps: number;
  commitments: AssetSecurityCommitment[];
}

export interface UseJoinServiceWithCommitmentsTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useJoinServiceWithCommitmentsTx = (
  options?: UseJoinServiceWithCommitmentsTxOptions,
) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TANGLE_ABI,
    (params: JoinServiceWithCommitmentsParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TANGLE_ABI,
      functionName: 'joinServiceWithCommitments' as const,
      args: [
        params.serviceId,
        params.exposureBps,
        params.commitments.map((c) => ({
          asset: {
            kind: c.asset.kind,
            token: c.asset.token,
          },
          exposureBps: c.exposureBps,
        })),
      ] as const,
    }),
    {
      txName: 'join service with commitments',
      txDetails: (params) =>
        new Map([
          ['Service ID', params.serviceId.toString()],
          ['Exposure', `${(params.exposureBps / 100).toFixed(2)}%`],
          ['Commitments', params.commitments.length.toString()],
        ]),
      getSuccessMessage: (params) =>
        `Successfully joined service #${params.serviceId} with security commitments`,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['serviceOperators'] });
        queryClient.invalidateQueries({ queryKey: ['serviceDetails'] });
        queryClient.invalidateQueries({ queryKey: ['exitStatus'] });
        options?.onSuccess?.();
      },
      onError: options?.onError,
    },
  );

  return {
    execute: hook.execute,
    status: hook.status,
    error: hook.error,
    reset: hook.reset,
    txHash: hook.txHash,
    isSuccess: hook.isSuccess,
    isPending: hook.isLoading,
  };
};

export default useJoinServiceWithCommitmentsTx;
