/**
 * EVM hook for approving a service request via the Tangle contract.
 *
 * Supports two approval modes:
 * - Simple approval: When no custom security requirements exist
 * - Approval with commitments: When custom asset requirements are defined
 */

import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useChainId } from 'wagmi';
import { zeroAddress } from 'viem';
import type { ContractSecurityCommitment } from '../../types';

export { TxStatus };

/**
 * Parameters for simple approval (no custom requirements)
 */
export interface SimpleApproveParams {
  requestId: bigint;
  stakingPercent: number;
  /** TNT exposure in basis points (0-10000). When > 0, calls the 3-arg approveService overload. */
  tntExposureBps?: number;
}

/**
 * Parameters for approval with commitments (custom requirements)
 */
export interface CommitmentsApproveParams {
  requestId: bigint;
  securityCommitments: ContractSecurityCommitment[];
}

export type ServiceApproveParams =
  | SimpleApproveParams
  | CommitmentsApproveParams;

/**
 * Options for the useServiceApproveTx hook
 */
export interface UseServiceApproveTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Type guard to check if params include security commitments
 */
const hasSecurityCommitments = (
  params: ServiceApproveParams,
): params is CommitmentsApproveParams => {
  return (
    'securityCommitments' in params &&
    Array.isArray(params.securityCommitments) &&
    params.securityCommitments.length > 0
  );
};

/**
 * Hook for approving a service request.
 *
 * Uses the appropriate contract method based on provided parameters:
 * - `approveService` when only stakingPercent is provided (simple approval)
 * - `approveServiceWithCommitments` when securityCommitments are provided
 *
 * @example
 * ```tsx
 * const { execute, status, error } = useServiceApproveTx();
 *
 * // Simple approval (no custom requirements)
 * await execute({
 *   requestId: 1n,
 *   stakingPercent: 50,
 * });
 *
 * // Approval with commitments (custom requirements)
 * await execute({
 *   requestId: 1n,
 *   securityCommitments: [
 *     { asset: { kind: 1, token: '0x...' }, exposureBps: 7500 },
 *   ],
 * });
 * ```
 */
export const useServiceApproveTx = (options?: UseServiceApproveTxOptions) => {
  const chainId = useChainId();
  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }

  const hook = useContractWrite(
    TANGLE_ABI,
    async (params: ServiceApproveParams, _activeAddress) => {
      if (!contracts || contracts.tangle === zeroAddress) {
        return null;
      }

      // Check if we have security commitments (commitments mode)
      if (hasSecurityCommitments(params)) {
        // Format commitments for the contract
        const commitments = params.securityCommitments.map((c) => ({
          asset: {
            kind: c.asset.kind,
            token: c.asset.token,
          },
          exposureBps: c.exposureBps,
        }));

        return {
          address: contracts.tangle,
          abi: TANGLE_ABI,
          functionName: 'approveServiceWithCommitments' as const,
          args: [params.requestId, commitments] as const,
        };
      }

      // Simple approval mode
      const simpleParams = params as SimpleApproveParams;
      const stakingPercent = Math.min(
        100,
        Math.max(0, simpleParams.stakingPercent ?? 0),
      );

      // When tntExposureBps is set, use the 3-arg overload
      if (simpleParams.tntExposureBps && simpleParams.tntExposureBps > 0) {
        return {
          address: contracts.tangle,
          abi: TANGLE_ABI,
          functionName: 'approveService' as const,
          args: [
            params.requestId,
            stakingPercent,
            simpleParams.tntExposureBps,
          ] as const,
        };
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'approveService' as const,
        args: [params.requestId, stakingPercent] as const,
      };
    },
    {
      txName: 'approve service',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Request ID', params.requestId.toString());

        if (hasSecurityCommitments(params)) {
          details.set(
            'Commitments',
            `${params.securityCommitments.length} asset(s)`,
          );
        } else {
          const simpleParams = params as SimpleApproveParams;
          details.set('Staking Percent', `${simpleParams.stakingPercent}%`);
          if (simpleParams.tntExposureBps && simpleParams.tntExposureBps > 0) {
            details.set(
              'TNT Exposure',
              `${simpleParams.tntExposureBps / 100}%`,
            );
          }
        }

        return details;
      },
      getSuccessMessage: (params) =>
        `Successfully approved service request #${params.requestId}`,
      onSuccess: options?.onSuccess,
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

export default useServiceApproveTx;
