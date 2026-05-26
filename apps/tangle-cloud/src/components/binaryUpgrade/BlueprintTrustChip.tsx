import type { FC } from 'react';
import { AttestationKind } from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore';
import TrustScoreGauge from './TrustScoreGauge';
import { useBlueprintTrust } from './useBlueprintTrust';

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
 * The shared `useBlueprintTrust` hook lives in its own file so this
 * component file is exclusively component exports (Fast Refresh-friendly).
 */

interface BlueprintTrustChipProps {
  blueprintId: bigint;
  className?: string;
}

export const BlueprintTrustChip: FC<BlueprintTrustChipProps> = ({
  blueprintId,
  className,
}) => {
  const { data } = useBlueprintTrust(blueprintId);
  if (!data || data.attestationCount === 0) return null;
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
  );
};

interface AuditedPillProps {
  blueprintId: bigint;
  className?: string;
}

export const AuditedPill: FC<AuditedPillProps> = ({
  blueprintId,
  className,
}) => {
  const { data } = useBlueprintTrust(blueprintId);
  if (!data?.hasAuditedAttestation) return null;
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
  );
};

export default BlueprintTrustChip;
