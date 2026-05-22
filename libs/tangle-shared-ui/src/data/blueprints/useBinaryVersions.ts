/**
 * Chain-read hooks for the blueprint binary upgrade flow.
 *
 * Mirrors the pattern established by `fetchBlueprintsOnChain.ts`: the dapp
 * reads directly off the Tangle facet via viem `PublicClient`, then caches
 * the result through react-query. Hosted indexer support can layer on top
 * later — these hooks already return the canonical shape consumers want.
 */

import { useQuery, useQueries } from '@tanstack/react-query';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import type { Address, PublicClient } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import BinaryUpgradeABI from '../../abi/tangleBinaryUpgrade';
import BlueprintAuditorsABI from '../../abi/blueprintAuditors';
import {
  type AttestationKind,
  type Attestation,
  type Auditor,
  type AttestationWithAuditor,
  type AuditorTier,
} from '../../blueprintApps/trustScore';

// ─────────────────────────────────────────────────────────────────────────
// Types — mirror the on-chain ABI exactly so callers don't have to translate
// ─────────────────────────────────────────────────────────────────────────

export interface BinaryVersion {
  versionId: bigint;
  sha256Hash: `0x${string}`;
  binaryUri: string;
  attestationHash: `0x${string}`;
  publishedAt: bigint;
  deprecated: boolean;
}

export enum UpgradePolicy {
  APPROVE = 0,
  AUTO = 1,
  MANUAL = 2,
}

export interface ServiceUpgradeState {
  policy: UpgradePolicy;
  ackedVersionId: bigint;
  effectiveVersion: BinaryVersion | null;
  latestActiveVersionId: bigint | null;
  blueprintId: bigint | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const tangleAddressFor = (chainId: number): Address | null => {
  try {
    const contracts = getContractsByChainId(chainId);
    if (contracts.tangle === ZERO_ADDRESS) return null;
    return contracts.tangle as Address;
  } catch {
    return null;
  }
};

const auditorRegistryAddressFor = (chainId: number): Address | null => {
  try {
    const contracts = getContractsByChainId(chainId);
    if (contracts.blueprintAuditors === ZERO_ADDRESS) return null;
    return contracts.blueprintAuditors as Address;
  } catch {
    return null;
  }
};

const normalizeBinaryVersion = (raw: {
  versionId: bigint;
  sha256Hash: `0x${string}`;
  binaryUri: string;
  attestationHash: `0x${string}`;
  publishedAt: bigint;
  deprecated: boolean;
}): BinaryVersion => ({
  versionId: BigInt(raw.versionId),
  sha256Hash: raw.sha256Hash,
  binaryUri: raw.binaryUri,
  attestationHash: raw.attestationHash,
  publishedAt: BigInt(raw.publishedAt),
  deprecated: raw.deprecated,
});

const normalizeAttestation = (raw: {
  attester: Address;
  reportHash: `0x${string}`;
  reportUri: string;
  kind: number;
  severityFound: number;
  attestedAt: bigint;
  expiresAt: bigint;
  revoked: boolean;
}): Attestation => ({
  attester: raw.attester,
  reportHash: raw.reportHash,
  reportUri: raw.reportUri,
  kind: raw.kind as AttestationKind,
  severityFound: raw.severityFound,
  attestedAt: BigInt(raw.attestedAt),
  expiresAt: BigInt(raw.expiresAt),
  revoked: raw.revoked,
});

// ─────────────────────────────────────────────────────────────────────────
// fetchers — exposed so the publisher dialog can refresh after publish
// ─────────────────────────────────────────────────────────────────────────

export const fetchBinaryVersions = async (
  publicClient: PublicClient,
  chainId: number,
  blueprintId: bigint,
): Promise<BinaryVersion[]> => {
  const tangle = tangleAddressFor(chainId);
  if (!tangle) return [];

  const count = (await publicClient.readContract({
    address: tangle,
    abi: BinaryUpgradeABI,
    functionName: 'getBinaryVersionCount',
    args: [blueprintId],
  })) as bigint;

  if (count === BigInt(0)) return [];

  // The version count is bounded by publish events; batching all reads in
  // parallel via Promise.all is the same pattern fetchBlueprintsOnChain
  // uses for the blueprint list itself.
  const ids = Array.from({ length: Number(count) }, (_, i) => BigInt(i));
  const versions = await Promise.all(
    ids.map(async (versionId) => {
      try {
        const raw = (await publicClient.readContract({
          address: tangle,
          abi: BinaryUpgradeABI,
          functionName: 'getBinaryVersion',
          args: [blueprintId, versionId],
        })) as Parameters<typeof normalizeBinaryVersion>[0];
        return normalizeBinaryVersion(raw);
      } catch {
        return null;
      }
    }),
  );

  return versions.filter((v): v is BinaryVersion => v !== null);
};

export const fetchAttestations = async (
  publicClient: PublicClient,
  chainId: number,
  blueprintId: bigint,
  versionId: bigint,
): Promise<Attestation[]> => {
  const tangle = tangleAddressFor(chainId);
  if (!tangle) return [];

  try {
    const raw = (await publicClient.readContract({
      address: tangle,
      abi: BinaryUpgradeABI,
      functionName: 'listAttestations',
      args: [blueprintId, versionId],
    })) as Array<Parameters<typeof normalizeAttestation>[0]>;
    return raw.map(normalizeAttestation);
  } catch {
    return [];
  }
};

export const fetchAuditorOnChain = async (
  publicClient: PublicClient,
  chainId: number,
  address: Address,
): Promise<Auditor | null> => {
  const registry = auditorRegistryAddressFor(chainId);
  if (!registry) return null;

  try {
    const raw = (await publicClient.readContract({
      address: registry,
      abi: BlueprintAuditorsABI,
      functionName: 'getAuditor',
      args: [address],
    })) as {
      name: string;
      metadataUri: string;
      weight: number;
      tier: number;
      active: boolean;
      admittedAt: bigint;
    };

    // `admittedAt == 0` means the address was never admitted; treat as null
    // so the fallback chain (JSON registry) can take over.
    if (raw.admittedAt === BigInt(0)) return null;

    return {
      name: raw.name,
      metadataUri: raw.metadataUri,
      weight: raw.weight,
      tier: raw.tier as AuditorTier,
      active: raw.active,
      admittedAt: BigInt(raw.admittedAt),
    };
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────

export const useBinaryVersions = (
  blueprintId: bigint | undefined,
  options?: { enabled?: boolean },
) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: [
      'tangle',
      'binary-versions',
      chainId,
      blueprintId?.toString() ?? null,
    ],
    queryFn: async (): Promise<BinaryVersion[]> => {
      if (!publicClient || blueprintId === undefined) return [];
      return fetchBinaryVersions(publicClient, chainId, blueprintId);
    },
    enabled:
      (options?.enabled ?? true) &&
      blueprintId !== undefined &&
      publicClient !== undefined,
    // 60s mirrors the blueprint catalog cache — version publish is a
    // relatively cold event compared to "is an upgrade available now".
    staleTime: 60_000,
  });
};

export const useEffectiveBinaryVersion = (
  serviceId: bigint | undefined,
  options?: { enabled?: boolean },
) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: [
      'tangle',
      'effective-binary-version',
      chainId,
      serviceId?.toString() ?? null,
    ],
    queryFn: async (): Promise<BinaryVersion | null> => {
      if (!publicClient || serviceId === undefined) return null;
      const tangle = tangleAddressFor(chainId);
      if (!tangle) return null;

      try {
        const raw = (await publicClient.readContract({
          address: tangle,
          abi: BinaryUpgradeABI,
          functionName: 'effectiveBinaryVersion',
          args: [serviceId],
        })) as Parameters<typeof normalizeBinaryVersion>[0];
        return normalizeBinaryVersion(raw);
      } catch {
        // Effective version reverts `VersionNotFound` when the blueprint
        // has zero published binaries. That's not an error to surface —
        // the service simply hasn't been provisioned yet.
        return null;
      }
    },
    enabled:
      (options?.enabled ?? true) &&
      serviceId !== undefined &&
      publicClient !== undefined,
    // 10s stale: the operator approve-and-install flow ack's a new version;
    // we want the badge / panel to refresh quickly after they sign.
    staleTime: 10_000,
  });
};

export const useServiceUpgradeState = (
  serviceId: bigint | undefined,
  blueprintId: bigint | undefined,
  options?: { enabled?: boolean },
) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: [
      'tangle',
      'service-upgrade-state',
      chainId,
      serviceId?.toString() ?? null,
      blueprintId?.toString() ?? null,
    ],
    queryFn: async (): Promise<ServiceUpgradeState | null> => {
      if (!publicClient || serviceId === undefined) return null;
      const tangle = tangleAddressFor(chainId);
      if (!tangle) return null;

      // We read four things in parallel — these don't fan out further so
      // a single Promise.all is the right shape (vs. a multicall).
      const [policyRaw, ackedRaw, effective, activeId] = await Promise.all([
        publicClient.readContract({
          address: tangle,
          abi: BinaryUpgradeABI,
          functionName: 'getServiceUpgradePolicy',
          args: [serviceId],
        }) as Promise<number>,
        publicClient.readContract({
          address: tangle,
          abi: BinaryUpgradeABI,
          functionName: 'getServiceAckedVersionId',
          args: [serviceId],
        }) as Promise<bigint>,
        (async () => {
          try {
            const raw = (await publicClient.readContract({
              address: tangle,
              abi: BinaryUpgradeABI,
              functionName: 'effectiveBinaryVersion',
              args: [serviceId],
            })) as Parameters<typeof normalizeBinaryVersion>[0];
            return normalizeBinaryVersion(raw);
          } catch {
            return null;
          }
        })(),
        blueprintId !== undefined
          ? (publicClient.readContract({
              address: tangle,
              abi: BinaryUpgradeABI,
              functionName: 'getActiveBinaryVersionId',
              args: [blueprintId],
            }) as Promise<bigint>)
          : Promise.resolve(null),
      ]);

      return {
        policy: policyRaw as UpgradePolicy,
        ackedVersionId: BigInt(ackedRaw),
        effectiveVersion: effective,
        latestActiveVersionId: activeId !== null ? BigInt(activeId) : null,
        blueprintId: blueprintId ?? null,
      };
    },
    enabled:
      (options?.enabled ?? true) &&
      serviceId !== undefined &&
      publicClient !== undefined,
    staleTime: 10_000,
  });
};

/**
 * Look up a single auditor identity, with the dapp's fallback chain baked
 * in: on-chain registry → JSON bootstrap registry → null.
 *
 * The JSON registry is intentionally bundled per-app (the import is
 * resolved by Vite at build time). This hook lives in the shared lib so
 * Tangle Cloud + any future consumer can use the same lookup logic.
 *
 * `fallbackRegistry` should be the parsed `registry.json` from the
 * consuming app. Keys are lowercase 0x… addresses.
 */
export interface AuditorFallback {
  name: string;
  metadataUri: string;
  weight: number;
  tier: AuditorTier;
  active: boolean;
}

export const useAuditor = (
  address: Address | undefined,
  options?: {
    enabled?: boolean;
    fallback?: Record<string, AuditorFallback>;
  },
) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const fallback = options?.fallback ?? {};

  return useQuery({
    queryKey: ['tangle', 'auditor', chainId, address?.toLowerCase() ?? null],
    queryFn: async (): Promise<Auditor | null> => {
      if (!address || !publicClient) return null;

      // 1. On-chain registry takes priority. Once governance admits an
      //    auditor, that's the source of truth.
      const onChain = await fetchAuditorOnChain(publicClient, chainId, address);
      if (onChain !== null && onChain.active) return onChain;

      // 2. JSON bootstrap. Keys are lowercase; tolerate the input being
      //    checksummed by lowercasing the lookup.
      const entry = fallback[address.toLowerCase()];
      if (entry) {
        return {
          name: entry.name,
          metadataUri: entry.metadataUri,
          weight: entry.weight,
          tier: entry.tier,
          active: entry.active,
          // No on-chain admittedAt available — use 0 as "unknown".
          admittedAt: BigInt(0),
        };
      }

      // 3. Inactive on-chain row beats the JSON fallback (it represents
      //    a deliberate governance decision to revoke standing).
      if (onChain !== null) return onChain;

      return null;
    },
    enabled:
      (options?.enabled ?? true) &&
      address !== undefined &&
      publicClient !== undefined,
    // Auditor identity rarely changes; cache for 5 min.
    staleTime: 300_000,
  });
};

/**
 * List attestations for a given version, with auditor identity joined in.
 *
 * Auditor lookups fan out via `useQueries` so a list with N attesters
 * hits the chain in a single batch of N parallel calls (viem batches
 * automatically when the transport supports it).
 */
export const useVersionAttestations = (
  blueprintId: bigint | undefined,
  versionId: bigint | undefined,
  options?: {
    enabled?: boolean;
    fallback?: Record<string, AuditorFallback>;
  },
) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const attestationsQuery = useQuery({
    queryKey: [
      'tangle',
      'attestations',
      chainId,
      blueprintId?.toString() ?? null,
      versionId?.toString() ?? null,
    ],
    queryFn: async (): Promise<Attestation[]> => {
      if (!publicClient || blueprintId === undefined || versionId === undefined)
        return [];
      return fetchAttestations(publicClient, chainId, blueprintId, versionId);
    },
    enabled:
      (options?.enabled ?? true) &&
      blueprintId !== undefined &&
      versionId !== undefined &&
      publicClient !== undefined,
    staleTime: 30_000,
  });

  const attestations = attestationsQuery.data ?? [];
  const fallback = options?.fallback ?? {};

  // Look up each attester. Unknown auditors return null; consumers render
  // those as "Anonymous (0x…)" rather than suppressing the row.
  const uniqueAttesters = Array.from(
    new Set(attestations.map((a) => a.attester.toLowerCase())),
  ) as Address[];
  const auditorQueries = useQueries({
    queries: uniqueAttesters.map((address) => ({
      queryKey: ['tangle', 'auditor', chainId, address],
      queryFn: async (): Promise<Auditor | null> => {
        if (!publicClient) return null;
        const onChain = await fetchAuditorOnChain(
          publicClient,
          chainId,
          address,
        );
        if (onChain !== null && onChain.active) return onChain;
        const entry = fallback[address];
        if (entry) {
          return {
            name: entry.name,
            metadataUri: entry.metadataUri,
            weight: entry.weight,
            tier: entry.tier,
            active: entry.active,
            admittedAt: BigInt(0),
          };
        }
        if (onChain !== null) return onChain;
        return null;
      },
      enabled: publicClient !== undefined,
      staleTime: 300_000,
    })),
  });

  const auditorMap = new Map<string, Auditor | null>();
  uniqueAttesters.forEach((address, idx) => {
    auditorMap.set(address, auditorQueries[idx]?.data ?? null);
  });

  const joined: AttestationWithAuditor[] = attestations.map((a) => ({
    ...a,
    auditor: auditorMap.get(a.attester.toLowerCase()) ?? null,
  }));

  return {
    data: joined,
    isLoading:
      attestationsQuery.isLoading || auditorQueries.some((q) => q.isLoading),
    error: attestationsQuery.error,
    refetch: attestationsQuery.refetch,
  };
};
