import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useChainId, usePublicClient } from 'wagmi';
import {
  fetchAttestations,
  fetchAuditorOnChain,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import {
  AttestationKind,
  computeTrustScore,
  type Auditor,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore';
import BinaryUpgradeABI from '@tangle-network/tangle-shared-ui/abi/tangleBinaryUpgrade';
import type { Address } from 'viem';
import { auditorFallbackRegistry } from '../../auditors';

export interface BlueprintTrustData {
  score: number;
  hasCriticalFinding: boolean;
  hasAuditedAttestation: boolean;
  attestationCount: number;
}

const NO_DATA: BlueprintTrustData = {
  score: 0,
  hasCriticalFinding: false,
  hasAuditedAttestation: false,
  attestationCount: 0,
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Fetches the active version's attestations for a blueprint and returns a
 * compact trust summary. Lives in its own file so the consuming component
 * file (`BlueprintTrustChip.tsx`) is exclusively component exports — keeps
 * React Fast Refresh happy. Shared cache key with `BlueprintTrustChip` and
 * the catalog's `useAuditedStatusMap` so all three components hit the same
 * react-query entry.
 */
export const useBlueprintTrust = (blueprintId: bigint | undefined) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const fallback = useMemo(() => auditorFallbackRegistry(), []);

  return useQuery({
    queryKey: [
      'tangle',
      'blueprint-trust',
      chainId,
      blueprintId?.toString() ?? null,
    ],
    queryFn: async (): Promise<BlueprintTrustData> => {
      if (!publicClient || blueprintId === undefined) return NO_DATA;
      let tangle: Address;
      try {
        tangle = getContractsByChainId(chainId).tangle as Address;
      } catch {
        return NO_DATA;
      }
      if (tangle === ZERO_ADDRESS) return NO_DATA;

      const [count, activeId] = await Promise.all([
        publicClient.readContract({
          address: tangle,
          abi: BinaryUpgradeABI,
          functionName: 'getBinaryVersionCount',
          args: [blueprintId],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: tangle,
          abi: BinaryUpgradeABI,
          functionName: 'getActiveBinaryVersionId',
          args: [blueprintId],
        }) as Promise<bigint>,
      ]);
      if (count === 0n) return NO_DATA;

      const attestations = await fetchAttestations(
        publicClient,
        chainId,
        blueprintId,
        BigInt(activeId),
      );
      if (attestations.length === 0) return NO_DATA;

      const uniqueAttesters = Array.from(
        new Set(attestations.map((a) => a.attester.toLowerCase())),
      ) as Address[];
      const auditors = await Promise.all(
        uniqueAttesters.map(async (address): Promise<Auditor | null> => {
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
              admittedAt: 0n,
            };
          }
          return onChain;
        }),
      );
      const auditorMap = new Map<string, Auditor | null>();
      uniqueAttesters.forEach((address, idx) => {
        auditorMap.set(address, auditors[idx] ?? null);
      });

      const joined = attestations.map((a) => ({
        ...a,
        auditor: auditorMap.get(a.attester.toLowerCase()) ?? null,
      }));

      const breakdown = computeTrustScore(joined);
      // "Audited" pill rule: at least one non-revoked, non-expired,
      // non-SELF attestation from a known auditor.
      const hasAuditedAttestation = joined.some(
        (row) =>
          !row.revoked &&
          (row.expiresAt === 0n ||
            Number(row.expiresAt) > Math.floor(Date.now() / 1000)) &&
          row.kind !== AttestationKind.SELF &&
          row.auditor !== null &&
          row.auditor.active,
      );

      return {
        score: breakdown.score,
        hasCriticalFinding: breakdown.hasCriticalFinding,
        hasAuditedAttestation,
        attestationCount: breakdown.attestationCount,
      };
    },
    enabled: blueprintId !== undefined && publicClient !== undefined,
    staleTime: 60_000,
  });
};
