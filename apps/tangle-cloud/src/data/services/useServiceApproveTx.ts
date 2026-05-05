/**
 * EVM hook for approving a service request via the Tangle contract.
 *
 * Uses the unified `approveService(ApprovalParams)` entrypoint introduced in
 * tnt-core PR #119. Optional capabilities (security commitments, BLS pubkey,
 * TEE attestation commitments) are opt-in via empty/zero fields on the params
 * struct.
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

/** A TEE attestation commitment matching `Types.TeeAttestationCommitment`. */
export interface TeeAttestationCommitment {
  /** Backend enum index — Unset=0, Phala=1, AwsNitro=2, GcpConfidential=3, AzureSkr=4, DirectTdx=5 (rejected on-chain). */
  backend: number;
  expectedMeasurement: `0x${string}`;
  /** Must equal `teeNonceFor(requestId)` exposed by the Tangle contract. */
  nonceBinding: `0x${string}`;
  /** Unix seconds; `0` means no expiry. Must be ≤ now + 90 days when non-zero. */
  expiresAt: bigint;
}

/**
 * Parameters for `useServiceApproveTx`. All optional fields default to empty
 * arrays / zero values, which the contract treats as opt-out.
 */
export interface ServiceApproveParams {
  requestId: bigint;
  /** When omitted, approval implies no per-asset commitments (must be acceptable for the request). */
  securityCommitments?: ContractSecurityCommitment[];
  /** BLS G2 pubkey [x0, x1, y0, y1]. Default `[0,0,0,0]` opts out of BLS aggregation. */
  blsPubkey?: readonly [bigint, bigint, bigint, bigint];
  /** BLS G1 PoP signature; only validated when `blsPubkey` is non-zero. */
  blsPopSignature?: readonly [bigint, bigint];
  /** TEE attestation profiles. Default `[]` opts out of TEE binding for this approval. */
  teeCommitments?: TeeAttestationCommitment[];
}

export interface UseServiceApproveTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const ZERO_BLS_PUBKEY = [0n, 0n, 0n, 0n] as const;
const ZERO_BLS_POP = [0n, 0n] as const;

/**
 * Hook for approving a service request via the unified `approveService` entrypoint.
 *
 * @example
 * ```tsx
 * const { execute } = useServiceApproveTx();
 *
 * // Minimal approval (no commitments, no BLS, no TEE).
 * await execute({ requestId: 1n });
 *
 * // With per-asset security commitments.
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

      const securityCommitments = (params.securityCommitments ?? []).map(
        (c) => ({
          asset: { kind: c.asset.kind, token: c.asset.token },
          exposureBps: c.exposureBps,
        }),
      );

      const teeCommitments = (params.teeCommitments ?? []).map((c) => ({
        backend: c.backend,
        expectedMeasurement: c.expectedMeasurement,
        nonceBinding: c.nonceBinding,
        expiresAt: c.expiresAt,
      }));

      const approvalParams = {
        requestId: params.requestId,
        securityCommitments,
        blsPubkey: params.blsPubkey ?? ZERO_BLS_PUBKEY,
        blsPopSignature: params.blsPopSignature ?? ZERO_BLS_POP,
        teeCommitments,
      } as const;

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'approveService' as const,
        args: [approvalParams] as const,
      };
    },
    {
      txName: 'approve service',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Request ID', params.requestId.toString());
        const commitmentCount = params.securityCommitments?.length ?? 0;
        if (commitmentCount > 0) {
          details.set('Commitments', `${commitmentCount} asset(s)`);
        }
        const teeCount = params.teeCommitments?.length ?? 0;
        if (teeCount > 0) {
          details.set('TEE Profiles', `${teeCount}`);
        }
        const blsActive = (params.blsPubkey ?? ZERO_BLS_PUBKEY).some(
          (v) => v !== 0n,
        );
        if (blsActive) {
          details.set('BLS', 'registered');
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
