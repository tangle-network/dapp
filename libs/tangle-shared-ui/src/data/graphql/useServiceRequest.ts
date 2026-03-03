/**
 * Hook for requesting services via the Tangle contract.
 */

import { useCallback, useState } from 'react';
import { Address, zeroAddress } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import TangleABI from '../../abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import useContractWrite, { TxStatus } from '../../hooks/useContractWrite';
export { encodeServiceConfig } from './encodeServiceConfig';

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
  const { chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [result, setResult] = useState<ServiceRequestResult>({});

  const hook = useContractWrite<
    typeof TangleABI,
    'requestService' | 'requestServiceWithSecurity',
    ServiceRequestParams
  >(
    TangleABI,
    async (params: ServiceRequestParams, _activeAddress) => {
      if (!chainId) {
        throw new Error('Wallet not connected');
      }

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

      const securityRequirements = params.securityRequirements ?? [];
      const hasSecurityRequirements = securityRequirements.length > 0;

      if (hasSecurityRequirements) {
        return {
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
          value:
            params.paymentToken === zeroAddress
              ? params.paymentAmount
              : BigInt(0),
        };
      }

      return {
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
        value:
          params.paymentToken === zeroAddress
            ? params.paymentAmount
            : BigInt(0),
      };
    },
    {
      txName: 'deploy blueprint',
      txDetails: (params) =>
        new Map([
          ['Blueprint ID', params.blueprintId.toString()],
          ['Operators', params.operators.length.toString()],
          [
            'Security Requirements',
            params.securityRequirements?.length ? 'Custom' : 'Default',
          ],
        ]),
      getSuccessMessage: (params) =>
        `Successfully deployed blueprint #${params.blueprintId}`,
    },
  );

  const execute = useCallback(
    async (params: ServiceRequestParams): Promise<ServiceRequestResult> => {
      if (!walletClient || !publicClient || !chainId || hook.execute === null) {
        const error = new Error('Wallet not connected');
        setResult({ error });
        return { error };
      }

      setResult({});
      const txResult = await hook.execute(params);
      if (!txResult) {
        const error = hook.error ?? new Error('Service request failed');
        setResult({ error });
        return { error };
      }

      const simulatedResult = txResult.simulatedResult;
      const requestId =
        typeof simulatedResult === 'bigint'
          ? simulatedResult
          : Array.isArray(simulatedResult) &&
              typeof simulatedResult[0] === 'bigint'
            ? simulatedResult[0]
            : undefined;

      const successResult: ServiceRequestResult = {
        requestId,
        txHash: txResult.hash,
      };
      setResult(successResult);
      return successResult;
    },
    [chainId, hook, publicClient, walletClient],
  );

  const reset = useCallback(() => {
    hook.reset();
    setResult({});
  }, [hook]);

  const status: ServiceRequestStatus =
    hook.status === TxStatus.NOT_YET_INITIATED
      ? 'idle'
      : hook.status === TxStatus.PROCESSING
        ? 'pending'
        : hook.status === TxStatus.COMPLETE
          ? 'success'
          : 'error';

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
