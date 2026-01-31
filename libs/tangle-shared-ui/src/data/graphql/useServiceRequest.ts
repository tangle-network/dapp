/**
 * Hook for requesting services via the Tangle contract.
 */

import { useCallback, useState } from 'react';
import { Address, parseEventLogs, zeroAddress } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import TangleABI from '../../abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

/**
 * Asset security requirement for requestServiceWithSecurity.
 * Exposure values are in basis points (1% = 100 bps).
 */
export interface AssetSecurityRequirement {
  asset: {
    kind: number; // AssetKind enum: 0 = Native, 1 = ERC20
    token: Address;
  };
  minExposureBps: number;
  maxExposureBps: number;
}

export interface ServiceRequestParams {
  blueprintId: bigint;
  operators: Address[];
  config: `0x${string}`; // Encoded service configuration
  permittedCallers: Address[];
  ttl: bigint;
  paymentToken: Address;
  paymentAmount: bigint;
  /**
   * Optional security requirements for the service.
   * When provided, requestServiceWithSecurity() is called instead of requestService().
   */
  securityRequirements?: AssetSecurityRequirement[];
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

        // Determine which contract function to use based on security requirements
        const hasSecurityRequirements =
          params.securityRequirements && params.securityRequirements.length > 0;

        // Use type assertion to avoid "union type too complex" error from large ABI
        let simulateRequest;

        if (hasSecurityRequirements) {
          // Use requestServiceWithSecurity when security requirements are provided
          const result = await (publicClient as any).simulateContract({
            address: tangleAddress,
            abi: TangleABI,
            functionName: 'requestServiceWithSecurity' as const,
            args: [
              params.blueprintId,
              params.operators,
              params.securityRequirements,
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
          simulateRequest = result.request;
        } else {
          // Use requestService when no security requirements
          const result = await (publicClient as any).simulateContract({
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
          simulateRequest = result.request;
        }

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
          const event = parsed[0] as unknown as
            | { args: { requestId: bigint } }
            | undefined;
          requestId = event?.args?.requestId;
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
 * Contract expects TLV binary format. For blueprints with no request params,
 * return empty bytes (0x). For blueprints with request params, throw an error
 * as full TLV encoding is not yet implemented.
 */
export const encodeServiceConfig = (requestArgs: unknown[]): `0x${string}` => {
  // For blueprints with no request params, return empty bytes
  if (!requestArgs || requestArgs.length === 0) {
    return '0x';
  }

  // TODO: Implement full TLV encoding for blueprints with request params
  // For now, throw error to prevent silent failures with incorrect encoding
  throw new Error(
    'Blueprints with request parameters are not yet supported. ' +
      'Request argument encoding requires TLV binary format implementation.',
  );
};

export default useServiceRequestTx;
