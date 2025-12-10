/**
 * EVM hook for approving a service request via the Tangle contract.
 */

import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import TangleABI from '@tangle-network/tangle-shared-ui/abi/Tangle';
import { getTangleContractAddress } from '@tangle-network/tangle-shared-ui/constants/tangleContracts';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

export interface ServiceApproveParams {
  requestId: bigint;
  restakingPercent: number; // 0-100
}

/**
 * Hook for approving a service request.
 */
export const useServiceApproveTx = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const {
    execute: executeWrite,
    status,
    error,
    reset,
    txHash,
  } = useContractWrite();

  const execute = useCallback(
    async (params: ServiceApproveParams) => {
      if (!address || !publicClient || !walletClient) {
        return null;
      }

      const chainId = await publicClient.getChainId();
      const tangleAddress = getTangleContractAddress(chainId);

      if (!tangleAddress) {
        throw new Error(`Tangle contract not deployed on chain ${chainId}`);
      }

      // Encode the approve call
      const data = encodeFunctionData({
        abi: TangleABI,
        functionName: 'approve',
        args: [params.requestId, params.restakingPercent],
      });

      return executeWrite({
        to: tangleAddress,
        data,
        value: 0n,
      });
    },
    [address, publicClient, walletClient, executeWrite],
  );

  return {
    execute: address && publicClient && walletClient ? execute : null,
    status,
    error,
    reset,
    txHash,
    isSuccess: status === TxStatus.COMPLETE,
    isPending: status === TxStatus.PROCESSING,
  };
};

export default useServiceApproveTx;
