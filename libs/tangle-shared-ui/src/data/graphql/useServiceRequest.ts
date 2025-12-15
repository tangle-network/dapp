/**
 * Hook for requesting services via the Tangle contract.
 */

import { useCallback, useState } from 'react';
import { Address, encodeFunctionData, parseEventLogs, zeroAddress } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import TangleABI from '../../abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

export interface ServiceRequestParams {
  blueprintId: bigint;
  operators: Address[];
  config: `0x${string}`; // Encoded service configuration
  permittedCallers: Address[];
  ttl: bigint;
  paymentToken: Address;
  paymentAmount: bigint;
}

export type ServiceRequestStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ServiceRequestResult {
  requestId?: bigint;
  txHash?: `0x${string}`;
  error?: Error;
}

/**
 * Hook to request a new service via the Tangle contract.
 */
export const useServiceRequestTx = () => {
  const { address: userAddress, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [status, setStatus] = useState<ServiceRequestStatus>('idle');
  const [result, setResult] = useState<ServiceRequestResult>({});

  const execute = useCallback(
    async (params: ServiceRequestParams): Promise<ServiceRequestResult> => {
      if (!userAddress || !walletClient || !publicClient || !chainId) {
        const error = new Error('Wallet not connected');
        setStatus('error');
        setResult({ error });
        return { error };
      }

      setStatus('pending');
      setResult({});

      try {
        let contracts: ReturnType<typeof getContractsByChainId>;
        try {
          contracts = getContractsByChainId(chainId);
        } catch {
          throw new Error('Tangle contract not available on this network');
        }

        const tangleAddress = contracts.tangle;
        if (tangleAddress === zeroAddress) {
          throw new Error('Tangle contract not available on this network');
        }

        // Request service via Tangle contract
        // Use type assertion to avoid "union type too complex" error from large ABI
        const { request: simulateRequest } = await (
          publicClient as any
        ).simulateContract({
          address: tangleAddress,
          abi: TangleABI,
          functionName: 'requestService' as const,
          args: [
            params.blueprintId,
            params.operators,
            params.config,
            params.permittedCallers,
            params.ttl,
            params.paymentToken,
            params.paymentAmount,
          ] as const,
          account: userAddress,
          value:
            params.paymentToken === zeroAddress
              ? params.paymentAmount
              : BigInt(0),
        });

        const txHash = await walletClient.writeContract(simulateRequest);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (receipt.status === 'reverted') {
          throw new Error('Transaction reverted');
        }

        let requestId: bigint | undefined;
        try {
          const parsed = parseEventLogs({
            abi: TangleABI,
            logs: receipt.logs,
            eventName: 'ServiceRequested',
          });
          requestId = parsed[0]?.args?.requestId;
        } catch {
          // If the event isn't present (or decoding fails), still return the txHash.
        }

        const successResult: ServiceRequestResult = { requestId, txHash };
        setStatus('success');
        setResult(successResult);
        return successResult;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('Service request failed');
        setStatus('error');
        setResult({ error: err });
        return { error: err };
      }
    },
    [userAddress, walletClient, publicClient, chainId],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult({});
  }, []);

  return {
    execute,
    status,
    result,
    reset,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

/**
 * Encode service configuration/request args for the requestService call.
 * This function should encode the request arguments based on the blueprint's schema.
 */
export const encodeServiceConfig = (requestArgs: unknown[]): `0x${string}` => {
  // TODO: Implement proper encoding based on blueprint requestParams schema
  // For now, return empty bytes
  if (requestArgs.length === 0) {
    return '0x';
  }

  // Basic encoding - this will need to be customized based on the blueprint
  const encoded = encodeFunctionData({
    abi: [
      {
        type: 'function',
        name: 'config',
        inputs: [{ type: 'bytes', name: 'data' }],
      },
    ],
    functionName: 'config',
    args: [JSON.stringify(requestArgs)],
  });

  return encoded;
};

export default useServiceRequestTx;
