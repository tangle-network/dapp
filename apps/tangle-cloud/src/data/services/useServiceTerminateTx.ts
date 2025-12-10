/**
 * EVM hook for terminating a service via the Tangle contract.
 */

import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import TangleABI from '@tangle-network/tangle-shared-ui/abi/Tangle';
import { getTangleContractAddress } from '@tangle-network/tangle-shared-ui/constants/tangleContracts';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

export interface ServiceTerminateParams {
  serviceId: bigint;
}

/**
 * Hook for terminating a service instance.
 */
export const useServiceTerminateTx = () => {
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
    async (params: ServiceTerminateParams) => {
      if (!address || !publicClient || !walletClient) {
        return null;
      }

      const chainId = await publicClient.getChainId();
      const tangleAddress = getTangleContractAddress(chainId);

      if (!tangleAddress) {
        throw new Error(`Tangle contract not deployed on chain ${chainId}`);
      }

      // Encode the terminate call
      const data = encodeFunctionData({
        abi: TangleABI,
        functionName: 'terminate',
        args: [params.serviceId],
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

export default useServiceTerminateTx;
