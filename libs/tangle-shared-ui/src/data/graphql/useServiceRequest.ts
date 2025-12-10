/**
 * Hook for requesting services via the Tangle contract.
 */

import { useCallback, useState } from 'react';
import { Address, encodeFunctionData, zeroAddress } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import TangleABI from '../../abi/Tangle';
import { getTangleContractAddress } from '../../constants/tangleContracts';

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

      const tangleAddress = getTangleContractAddress(chainId);
      if (!tangleAddress) {
        const error = new Error('Tangle contract not available on this network');
        setStatus('error');
        setResult({ error });
        return { error };
      }

      setStatus('pending');
      setResult({});

      try {
        // Request service via Tangle contract
        const { request: simulateRequest } = await publicClient.simulateContract({
          address: tangleAddress,
          abi: TangleABI,
          functionName: 'requestService',
          args: [
            params.blueprintId,
            params.operators,
            params.config,
            params.permittedCallers,
            params.ttl,
            params.paymentToken,
            params.paymentAmount,
          ],
          account: userAddress,
          value: params.paymentToken === zeroAddress ? params.paymentAmount : 0n,
        });

        const txHash = await walletClient.writeContract(simulateRequest);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        if (receipt.status === 'reverted') {
          throw new Error('Transaction reverted');
        }

        // Parse the ServiceRequested event to get the request ID
        // Event: ServiceRequested(uint64 indexed requestId, uint64 indexed blueprintId, address requester)
        const serviceRequestedEvent = receipt.logs.find((log) => {
          // The event signature hash for ServiceRequested
          return log.topics[0] === '0x' + 'ServiceRequested'.padEnd(64, '0'); // Simplified - actual implementation would decode properly
        });

        let requestId: bigint | undefined;
        if (serviceRequestedEvent && serviceRequestedEvent.topics[1]) {
          requestId = BigInt(serviceRequestedEvent.topics[1]);
        }

        const successResult: ServiceRequestResult = { requestId, txHash };
        setStatus('success');
        setResult(successResult);
        return successResult;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Service request failed');
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
    abi: [{ type: 'function', name: 'config', inputs: [{ type: 'bytes', name: 'data' }] }],
    functionName: 'config',
    args: [JSON.stringify(requestArgs)],
  });

  return encoded;
};

export default useServiceRequestTx;
