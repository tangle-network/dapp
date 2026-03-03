/**
 * Hook for requesting services via the Tangle contract.
 */

import { useCallback, useState } from 'react';
import { Address, parseEventLogs, zeroAddress } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import TangleABI from '../../abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

/**
 * Asset kind for security requirements.
 * Matches the Tangle contract's AssetKind enum.
 */
export enum AssetKind {
  Native = 0,
  ERC20 = 1,
}

/** Conversion factor from percentage to basis points (1% = 100 bps) */
export const PERCENT_TO_BASIS_POINTS = 100;
const BPS_DENOMINATOR = 10_000;

/**
 * Asset security requirement for requestServiceWithSecurity.
 * Exposure values are in basis points (1% = 100 bps).
 */
export interface AssetSecurityRequirement {
  asset: {
    kind: AssetKind;
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
   * Optional explicit operator exposure commitments for requestServiceWithExposure.
   * Values are basis points (1% = 100, 100% = 10000).
   */
  exposureBps?: number[];
  /**
   * Optional security requirements for the service.
   * When provided, requestServiceWithSecurity() is called instead of requestService().
   */
  securityRequirements?: AssetSecurityRequirement[];
}

export type ServiceRequestFunctionName =
  | 'requestService'
  | 'requestServiceWithExposure'
  | 'requestServiceWithSecurity';

const hasValues = <T>(value: T[] | undefined): value is T[] => {
  return Array.isArray(value) && value.length > 0;
};

export const selectRequestFunction = (
  params: ServiceRequestParams,
): ServiceRequestFunctionName => {
  if (hasValues(params.securityRequirements)) {
    return 'requestServiceWithSecurity';
  }

  if (hasValues(params.exposureBps)) {
    return 'requestServiceWithExposure';
  }

  return 'requestService';
};

export const validateServiceRequestParams = (
  params: ServiceRequestParams,
): void => {
  const exposureBps = params.exposureBps ?? [];
  const securityRequirements = params.securityRequirements ?? [];
  const hasExposureBps = exposureBps.length > 0;
  const hasSecurityRequirements = securityRequirements.length > 0;

  if (hasExposureBps && hasSecurityRequirements) {
    throw new Error(
      'Exposure commitments and security requirements are mutually exclusive',
    );
  }

  if (hasExposureBps) {
    if (exposureBps.length !== params.operators.length) {
      throw new Error(
        `Exposure commitments length mismatch: expected ${params.operators.length}, got ${exposureBps.length}`,
      );
    }

    exposureBps.forEach((exposureValue, index) => {
      if (!Number.isInteger(exposureValue)) {
        throw new Error(
          `Exposure commitment at index ${index} must be an integer`,
        );
      }

      if (exposureValue < 1 || exposureValue > BPS_DENOMINATOR) {
        throw new Error(
          `Exposure commitment at index ${index} must be between 1 and ${BPS_DENOMINATOR} bps`,
        );
      }
    });
  }

  if (hasSecurityRequirements) {
    securityRequirements.forEach((requirement, index) => {
      if (
        !Number.isInteger(requirement.minExposureBps) ||
        !Number.isInteger(requirement.maxExposureBps)
      ) {
        throw new Error(
          `Security requirement at index ${index} must use integer exposure values`,
        );
      }

      if (
        requirement.minExposureBps < 1 ||
        requirement.minExposureBps > BPS_DENOMINATOR ||
        requirement.maxExposureBps < 1 ||
        requirement.maxExposureBps > BPS_DENOMINATOR
      ) {
        throw new Error(
          `Security requirement at index ${index} must be between 1 and ${BPS_DENOMINATOR} bps`,
        );
      }

      if (requirement.minExposureBps > requirement.maxExposureBps) {
        throw new Error(
          `Security requirement at index ${index} has minExposureBps greater than maxExposureBps`,
        );
      }
    });
  }
};

export type ServiceRequestStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ServiceRequestResult {
  requestId?: bigint;
  txHash?: `0x${string}`;
  error?: Error;
}

type ServiceRequestEventName =
  | 'ServiceRequested'
  | 'ServiceRequestedWithSecurity';

export const extractServiceRequestIdFromLogs = (
  logs: readonly unknown[],
): bigint | undefined => {
  const eventNames: ServiceRequestEventName[] = [
    'ServiceRequested',
    'ServiceRequestedWithSecurity',
  ];

  for (const eventName of eventNames) {
    try {
      const parsed = parseEventLogs({
        abi: TangleABI,
        logs: logs as Parameters<typeof parseEventLogs>[0]['logs'],
        eventName,
      });

      const event = parsed[0] as unknown as
        | { args: { requestId: bigint } }
        | undefined;
      const requestId = event?.args?.requestId;

      if (requestId !== undefined) {
        return requestId;
      }
    } catch {
      // Best-effort parsing; fall through to other event variants.
    }
  }

  return undefined;
};

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
        validateServiceRequestParams(params);

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

        const requestFunction = selectRequestFunction(params);
        const exposureBps = params.exposureBps ?? [];
        const securityRequirements = params.securityRequirements ?? [];

        // Use type assertion to avoid "union type too complex" error from large ABI
        let simulateRequest;

        if (requestFunction === 'requestServiceWithSecurity') {
          const result = await (publicClient as any).simulateContract({
            address: tangleAddress,
            abi: TangleABI,
            functionName: 'requestServiceWithSecurity' as const,
            args: [
              params.blueprintId,
              params.operators,
              securityRequirements,
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
        } else if (requestFunction === 'requestServiceWithExposure') {
          const result = await (publicClient as any).simulateContract({
            address: tangleAddress,
            abi: TangleABI,
            functionName: 'requestServiceWithExposure' as const,
            args: [
              params.blueprintId,
              params.operators,
              exposureBps,
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

        const requestId = extractServiceRequestIdFromLogs(receipt.logs);

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

export default useServiceRequestTx;
