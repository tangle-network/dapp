import { type FC, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useChainId, usePublicClient } from 'wagmi'
import {
  fetchAttestations,
  fetchAuditorOnChain,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions'
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts'
import {
  AttestationKind,
  computeTrustScore,
  type Auditor,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore'
import TrustScoreGauge from './TrustScoreGauge'
import BinaryUpgradeABI from '@tangle-network/tangle-shared-ui/abi/tangleBinaryUpgrade'
import type { Address } from 'viem'
import { auditorFallbackRegistry } from '../../auditors'

/**
 * Compact trust-score chip for the catalog card.
 *
 * Fetches the blueprint's active version + that version's attestations on
 * mount via react-query (per-chain, per-blueprint key) so navigating
 * between detail and catalog hits the cache instead of re-reading.
 *
 * Returns null when:
 *   - there's no active version (blueprint hasn't published anything)
 *   - there are zero attestations against the active version
 *
 * This keeps the catalog clean for un-attested blueprints — the absence
 * of the chip is itself the signal.
 *
 * The same query feeds `hasAuditedAttestation`, which the parent uses for
 * the "Audited only" filter — exported as a hook below.
 */

interface BlueprintTrustData {
  score: number
  hasCriticalFinding: boolean
  hasAuditedAttestation: boolean
  attestationCount: number
}

const NO_DATA: BlueprintTrustData = {
  score: 0,
  hasCriticalFinding: false,
  hasAuditedAttestation: false,
  attestationCount: 0,
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const useBlueprintTrust = (blueprintId: bigint | undefined) => {
  const chainId = useChainId()
  const publicClient = usePublicClient({ chainId })
  const fallback = useMemo(() => auditorFallbackRegistry(), [])

  return useQuery({
    queryKey: [
      'tangle',
      'blueprint-trust',
      chainId,
      blueprintId?.toString() ?? null,
    ],
    queryFn: async (): Promise<BlueprintTrustData> => {
      if (!publicClient || blueprintId === undefined) return NO_DATA
      let tangle: Address
      try {
        tangle = getContractsByChainId(chainId).tangle as Address
      } catch {
        return NO_DATA
      }
      if (tangle === ZERO_ADDRESS) return NO_DATA

      // 1. Read the active version id. If no versions are published this
      //    still returns 0 (the default), so we have to follow up with a
      //    version-count read before we can trust the value.
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
      ])
      if (count === 0n) return NO_DATA

      // 2. Pull attestations for the active version. If the active id is
      //    out of bounds (shouldn't happen — the contract gates writes),
      //    we get an empty list and the chip stays hidden.
      const attestations = await fetchAttestations(
        publicClient,
        chainId,
        blueprintId,
        BigInt(activeId),
      )
      if (attestations.length === 0) return NO_DATA

      // 3. Resolve auditor identity for each unique attester.
      const uniqueAttesters = Array.from(
        new Set(attestations.map((a) => a.attester.toLowerCase())),
      ) as Address[]
      const auditors = await Promise.all(
        uniqueAttesters.map(async (address): Promise<Auditor | null> => {
          const onChain = await fetchAuditorOnChain(publicClient, chainId, address)
          if (onChain !== null && onChain.active) return onChain
          const entry = fallback[address]
          if (entry) {
            return {
              name: entry.name,
              metadataUri: entry.metadataUri,
              weight: entry.weight,
              tier: entry.tier,
              active: entry.active,
              admittedAt: 0n,
            }
          }
          return onChain
        }),
      )
      const auditorMap = new Map<string, Auditor | null>()
      uniqueAttesters.forEach((address, idx) => {
        auditorMap.set(address, auditors[idx] ?? null)
      })

      const joined = attestations.map((a) => ({
        ...a,
        auditor: auditorMap.get(a.attester.toLowerCase()) ?? null,
      }))

      const breakdown = computeTrustScore(joined)
      // "Audited" pill rule: at least one non-revoked, non-expired,
      // non-SELF attestation from a known auditor. Mirrors the spec:
      // "any non-SELF attestation from a known auditor".
      const hasAuditedAttestation = joined.some(
        (row) =>
          !row.revoked &&
          (row.expiresAt === 0n ||
            Number(row.expiresAt) > Math.floor(Date.now() / 1000)) &&
          row.kind !== AttestationKind.SELF &&
          row.auditor !== null &&
          row.auditor.active,
      )

      return {
        score: breakdown.score,
        hasCriticalFinding: breakdown.hasCriticalFinding,
        hasAuditedAttestation,
        attestationCount: breakdown.attestationCount,
      }
    },
    enabled: blueprintId !== undefined && publicClient !== undefined,
    // 60s mirrors the blueprint catalog stale time.
    staleTime: 60_000,
  })
}

interface BlueprintTrustChipProps {
  blueprintId: bigint
  className?: string
}

export const BlueprintTrustChip: FC<BlueprintTrustChipProps> = ({
  blueprintId,
  className,
}) => {
  const { data } = useBlueprintTrust(blueprintId)
  if (!data || data.attestationCount === 0) return null
  return (
    <TrustScoreGauge
      breakdown={{
        score: data.score,
        attestationCount: data.attestationCount,
        kindBreakdown: {
          [AttestationKind.AUDIT]: 0,
          [AttestationKind.FUZZ]: 0,
          [AttestationKind.FORMAL]: 0,
          [AttestationKind.BUG_BOUNTY]: 0,
          [AttestationKind.SELF]: 0,
        },
        highestWeightedAuditor: null,
        hasCriticalFinding: data.hasCriticalFinding,
      }}
      variant="compact"
      className={className}
    />
  )
}

interface AuditedPillProps {
  blueprintId: bigint
  className?: string
}

export const AuditedPill: FC<AuditedPillProps> = ({
  blueprintId,
  className,
}) => {
  const { data } = useBlueprintTrust(blueprintId)
  if (!data?.hasAuditedAttestation) return null
  return (
    <span
      className={
        className ??
        'inline-flex items-center rounded-full border px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider'
      }
      style={{
        backgroundColor: 'hsl(150 70% 40% / 0.16)',
        borderColor: 'hsl(150 70% 55% / 0.5)',
        color: 'hsl(150 80% 78%)',
      }}
      title="Has at least one non-self attestation from a known auditor"
    >
      Audited
    </span>
  )
}

export default BlueprintTrustChip
