import type { AuditorFallback } from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions'
import registry from './registry.json'

/**
 * Returns the bootstrap auditor fallback map keyed by lowercase 0x… address.
 *
 * On networks where `BlueprintAuditors.getAuditor(address)` returns an
 * inactive / unadmitted row (or the contract isn't deployed yet), the
 * `useAuditor` hook consults this map so the dapp can render named
 * auditors against attestations on day 1 of the rollout.
 *
 * Entries are removed from this file as governance admits the real
 * on-chain address. Keep the map small — it's bundled into the dapp.
 */
export const auditorFallbackRegistry = (): Record<string, AuditorFallback> => {
  const entries = (registry as { auditors?: Record<string, unknown> }).auditors ?? {}
  const out: Record<string, AuditorFallback> = {}
  for (const [address, raw] of Object.entries(entries)) {
    if (typeof raw !== 'object' || raw === null) continue
    const candidate = raw as Partial<AuditorFallback>
    if (
      typeof candidate.name !== 'string' ||
      typeof candidate.metadataUri !== 'string' ||
      typeof candidate.weight !== 'number' ||
      typeof candidate.tier !== 'number' ||
      typeof candidate.active !== 'boolean'
    ) {
      continue
    }
    if (!candidate.active) continue
    out[address.toLowerCase()] = {
      name: candidate.name,
      metadataUri: candidate.metadataUri,
      weight: candidate.weight,
      tier: candidate.tier,
      active: candidate.active,
    }
  }
  return out
}
