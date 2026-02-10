/**
 * Hook for funding a service escrow via the Tangle contract.
 */

import { useQueryClient } from '@tanstack/react-query';
import useContractWrite, { TxStatus } from '../../hooks/useContractWrite';
import TangleABI from '../../abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';
import { formatUnits } from 'viem';

export { TxStatus };

export interface FundServiceParams {
  serviceId: bigint;
  amount: bigint;
  isNativeToken: boolean;
  tokenDecimals?: number;
  tokenSymbol?: string;
}

export interface UseFundServiceTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useFundServiceTx = (options?: UseFundServiceTxOptions) => {
  const chainId = useChainId();
  const contracts = getContractsByChainId(chainId);
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TangleABI,
    (params: FundServiceParams, _activeAddress) => ({
      address: contracts.tangle,
      abi: TangleABI,
      functionName: 'fundService' as const,
      args: [params.serviceId, params.amount] as const,
      value: params.isNativeToken ? params.amount : BigInt(0),
    }),
    {
      txName: 'fund service',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Service ID', params.serviceId.toString());
        const decimals = params.tokenDecimals ?? 18;
        const symbol = params.tokenSymbol ?? 'tokens';
        details.set(
          'Amount',
          `${formatUnits(params.amount, decimals)} ${symbol}`,
        );
        return details;
      },
      getSuccessMessage: (params) => {
        const decimals = params.tokenDecimals ?? 18;
        const symbol = params.tokenSymbol ?? 'tokens';
        return `Successfully funded service #${params.serviceId} with ${formatUnits(params.amount, decimals)} ${symbol}`;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['serviceEscrow'] });
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

export default useFundServiceTx;
