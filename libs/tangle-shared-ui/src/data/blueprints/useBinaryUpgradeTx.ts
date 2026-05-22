/**
 * Transaction hooks for the blueprint binary upgrade flow.
 *
 * Each hook is a thin wrapper around `useContractWrite` so it inherits
 * simulation, toast, error decoding, and `txHistory` recording. The hook
 * surface stays uniform with the rest of `data/services/*Tx.ts`:
 *   - `execute(params)` to submit
 *   - `status`, `error`, `isPending`, `isSuccess`, `txHash`
 *   - `reset()` to clear local state
 *
 * Returns a `result.status` from `useContractWrite.execute` of
 * `'success' | 'reverted'`; callers reset their local form on success.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import type { Address } from 'viem';

import useContractWrite, { TxStatus } from '../../hooks/useContractWrite';
import BinaryUpgradeABI from '../../abi/tangleBinaryUpgrade';
import { type AttestationKind } from '../../blueprintApps/trustScore';
import { UpgradePolicy } from './useBinaryVersions';

export { TxStatus };

interface BaseOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const tangleAddress = (chainId: number): Address => {
  const contracts = getContractsByChainId(chainId);
  if (contracts.tangle === ZERO_ADDRESS) {
    throw new Error(
      `Tangle facet not deployed on chain ${chainId}. Cannot submit binary-upgrade transactions.`,
    );
  }
  return contracts.tangle;
};

// ─────────────────────────────────────────────────────────────────────────
// publishBinaryVersion
// ─────────────────────────────────────────────────────────────────────────

export interface PublishBinaryVersionParams {
  blueprintId: bigint;
  sha256Hash: `0x${string}`;
  binaryUri: string;
  attestationHash: `0x${string}`;
}

export const usePublishBinaryVersionTx = (options?: BaseOptions) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    BinaryUpgradeABI,
    (params: PublishBinaryVersionParams) => ({
      address: tangleAddress(chainId),
      abi: BinaryUpgradeABI,
      functionName: 'publishBinaryVersion' as const,
      args: [
        params.blueprintId,
        params.sha256Hash,
        params.binaryUri,
        params.attestationHash,
      ] as const,
    }),
    {
      txName: 'publish binary version',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Blueprint ID', params.blueprintId.toString());
        details.set('sha256', params.sha256Hash);
        details.set('Binary URI', params.binaryUri);
        return details;
      },
      getSuccessMessage: (params) =>
        `Published a new binary version for blueprint #${params.blueprintId}`,
      onSuccess: (_result, params) => {
        // Invalidate every query keyed by this blueprint's version list.
        // The version count + active id are both bumped on publish.
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'binary-versions',
            chainId,
            params.blueprintId.toString(),
          ],
        });
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

// ─────────────────────────────────────────────────────────────────────────
// setActiveBinaryVersion
// ─────────────────────────────────────────────────────────────────────────

export interface SetActiveBinaryVersionParams {
  blueprintId: bigint;
  versionId: bigint;
}

export const useSetActiveBinaryVersionTx = (options?: BaseOptions) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    BinaryUpgradeABI,
    (params: SetActiveBinaryVersionParams) => ({
      address: tangleAddress(chainId),
      abi: BinaryUpgradeABI,
      functionName: 'setActiveBinaryVersion' as const,
      args: [params.blueprintId, params.versionId] as const,
    }),
    {
      txName: 'set active binary version',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Blueprint ID', params.blueprintId.toString());
        details.set('Active version', params.versionId.toString());
        return details;
      },
      getSuccessMessage: (params) =>
        `Promoted v${params.versionId} to active for blueprint #${params.blueprintId}`,
      onSuccess: (_result, params) => {
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'binary-versions',
            chainId,
            params.blueprintId.toString(),
          ],
        });
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

// ─────────────────────────────────────────────────────────────────────────
// deprecateBinaryVersion
// ─────────────────────────────────────────────────────────────────────────

export interface DeprecateBinaryVersionParams {
  blueprintId: bigint;
  versionId: bigint;
}

export const useDeprecateBinaryVersionTx = (options?: BaseOptions) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    BinaryUpgradeABI,
    (params: DeprecateBinaryVersionParams) => ({
      address: tangleAddress(chainId),
      abi: BinaryUpgradeABI,
      functionName: 'deprecateBinaryVersion' as const,
      args: [params.blueprintId, params.versionId] as const,
    }),
    {
      txName: 'deprecate binary version',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Blueprint ID', params.blueprintId.toString());
        details.set('Version', params.versionId.toString());
        return details;
      },
      getSuccessMessage: (params) =>
        `Deprecated v${params.versionId} for blueprint #${params.blueprintId}`,
      onSuccess: (_result, params) => {
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'binary-versions',
            chainId,
            params.blueprintId.toString(),
          ],
        });
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

// ─────────────────────────────────────────────────────────────────────────
// setServiceUpgradePolicy
// ─────────────────────────────────────────────────────────────────────────

export interface SetServiceUpgradePolicyParams {
  serviceId: bigint;
  policy: UpgradePolicy;
}

export const useSetServiceUpgradePolicyTx = (options?: BaseOptions) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    BinaryUpgradeABI,
    (params: SetServiceUpgradePolicyParams) => ({
      address: tangleAddress(chainId),
      abi: BinaryUpgradeABI,
      functionName: 'setServiceUpgradePolicy' as const,
      args: [params.serviceId, params.policy] as const,
    }),
    {
      txName: 'set upgrade policy',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Service ID', params.serviceId.toString());
        details.set('Policy', UpgradePolicy[params.policy] ?? 'unknown');
        return details;
      },
      getSuccessMessage: (params) =>
        `Set service #${params.serviceId} upgrade policy to ${UpgradePolicy[params.policy] ?? 'unknown'}`,
      onSuccess: (_result, params) => {
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'service-upgrade-state',
            chainId,
            params.serviceId.toString(),
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'effective-binary-version',
            chainId,
            params.serviceId.toString(),
          ],
        });
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

// ─────────────────────────────────────────────────────────────────────────
// ackBinaryVersion
// ─────────────────────────────────────────────────────────────────────────

export interface AckBinaryVersionParams {
  serviceId: bigint;
  versionId: bigint;
}

export const useAckBinaryVersionTx = (options?: BaseOptions) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    BinaryUpgradeABI,
    (params: AckBinaryVersionParams) => ({
      address: tangleAddress(chainId),
      abi: BinaryUpgradeABI,
      functionName: 'ackBinaryVersion' as const,
      args: [params.serviceId, params.versionId] as const,
    }),
    {
      txName: 'acknowledge binary version',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Service ID', params.serviceId.toString());
        details.set('Version', params.versionId.toString());
        return details;
      },
      getSuccessMessage: (params) =>
        `Acknowledged v${params.versionId} for service #${params.serviceId}`,
      onSuccess: (_result, params) => {
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'service-upgrade-state',
            chainId,
            params.serviceId.toString(),
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'effective-binary-version',
            chainId,
            params.serviceId.toString(),
          ],
        });
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

// ─────────────────────────────────────────────────────────────────────────
// attestBinaryVersion
// ─────────────────────────────────────────────────────────────────────────

export interface AttestBinaryVersionParams {
  blueprintId: bigint;
  versionId: bigint;
  reportHash: `0x${string}`;
  reportUri: string;
  kind: AttestationKind;
  severityFound: number;
  expiresAt: bigint;
}

export const useAttestBinaryVersionTx = (options?: BaseOptions) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    BinaryUpgradeABI,
    (params: AttestBinaryVersionParams) => ({
      address: tangleAddress(chainId),
      abi: BinaryUpgradeABI,
      functionName: 'attestBinaryVersion' as const,
      args: [
        params.blueprintId,
        params.versionId,
        params.reportHash,
        params.reportUri,
        params.kind,
        params.severityFound,
        params.expiresAt,
      ] as const,
    }),
    {
      txName: 'attest binary version',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Blueprint ID', params.blueprintId.toString());
        details.set('Version', params.versionId.toString());
        details.set('Report URI', params.reportUri);
        return details;
      },
      getSuccessMessage: (params) =>
        `Submitted attestation for blueprint #${params.blueprintId} v${params.versionId}`,
      onSuccess: (_result, params) => {
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'attestations',
            chainId,
            params.blueprintId.toString(),
            params.versionId.toString(),
          ],
        });
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

// ─────────────────────────────────────────────────────────────────────────
// revokeAttestation
// ─────────────────────────────────────────────────────────────────────────

export interface RevokeAttestationParams {
  blueprintId: bigint;
  versionId: bigint;
  attestationId: bigint;
  reasonUri: string;
}

export const useRevokeAttestationTx = (options?: BaseOptions) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    BinaryUpgradeABI,
    (params: RevokeAttestationParams) => ({
      address: tangleAddress(chainId),
      abi: BinaryUpgradeABI,
      functionName: 'revokeAttestation' as const,
      args: [
        params.blueprintId,
        params.versionId,
        params.attestationId,
        params.reasonUri,
      ] as const,
    }),
    {
      txName: 'revoke attestation',
      txDetails: (params) => {
        const details = new Map<string, string>();
        details.set('Blueprint ID', params.blueprintId.toString());
        details.set('Version', params.versionId.toString());
        details.set('Attestation', params.attestationId.toString());
        details.set('Reason URI', params.reasonUri);
        return details;
      },
      getSuccessMessage: (params) =>
        `Revoked attestation #${params.attestationId} on blueprint #${params.blueprintId} v${params.versionId}`,
      onSuccess: (_result, params) => {
        queryClient.invalidateQueries({
          queryKey: [
            'tangle',
            'attestations',
            chainId,
            params.blueprintId.toString(),
            params.versionId.toString(),
          ],
        });
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
