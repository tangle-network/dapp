/**
 * Trust-score aggregation for blueprint binary-version attestations.
 *
 * The on-chain `BlueprintsBinaryAttestations` registry is permissionless —
 * any address can attest. Aggregation is delegated to the off-chain
 * `BlueprintAuditors` registry (governance-curated address → weight map)
 * plus the attestation kind / severity / age signals captured per row.
 *
 * Scoring algorithm (intentionally simple, fully unit-testable):
 *
 *   score(attestation) =
 *     auditorWeight        // 0..1000 (zero for unknown / inactive)
 *   × kindMultiplier       // AUDIT 1.0, FORMAL 1.2, FUZZ 0.6,
 *                          // BUG_BOUNTY 0.5, SELF 0.1
 *   × severityModifier     // none 1.0, info 0.95, low 0.85, med 0.7,
 *                          // high 0.5, critical 0.3
 *   × recencyDecay         // 2^(-age_days / 365)  (half-life 1 year)
 *
 *   sum = Σ score(a) over all non-revoked, non-expired a
 *   final = clamp(round(sum / NORMALIZATION_DIVISOR * 100), 0, 100)
 *
 * `NORMALIZATION_DIVISOR` represents "what a portfolio of attestations
 * looks like at score 100": weight 1000 × kind 1.0 × severity 1.0 ×
 * recency 1.0. Two fresh max-weight clean audits comfortably saturate.
 *
 * Critical findings: any non-revoked, non-expired attestation with
 * severity ≥ 4 (high or critical) flips `hasCriticalFinding`. This is a
 * UI gate, not a score floor — a clean audit from one auditor plus a
 * critical finding from another should still score in the middle band.
 */

export enum AttestationKind {
  AUDIT = 0,
  FUZZ = 1,
  FORMAL = 2,
  BUG_BOUNTY = 3,
  SELF = 4,
}

export enum AuditorTier {
  FIRST_PARTY = 0,
  INDEPENDENT = 1,
  COMMUNITY = 2,
}

export interface Attestation {
  attester: `0x${string}`
  reportHash: `0x${string}`
  reportUri: string
  kind: AttestationKind
  severityFound: number
  attestedAt: bigint
  expiresAt: bigint
  revoked: boolean
}

export interface Auditor {
  name: string
  metadataUri: string
  weight: number
  tier: AuditorTier
  active: boolean
  admittedAt: bigint
}

export interface AttestationWithAuditor extends Attestation {
  auditor: Auditor | null
}

export interface TrustScoreBreakdown {
  score: number
  attestationCount: number
  // attestation counts per kind (after filtering out revoked + expired);
  // primarily for the "3 audits · 1 fuzz" footer next to the gauge.
  kindBreakdown: Record<AttestationKind, number>
  highestWeightedAuditor: string | null
  hasCriticalFinding: boolean
}

const KIND_MULTIPLIER: Record<AttestationKind, number> = {
  [AttestationKind.AUDIT]: 1.0,
  [AttestationKind.FORMAL]: 1.2,
  [AttestationKind.FUZZ]: 0.6,
  [AttestationKind.BUG_BOUNTY]: 0.5,
  [AttestationKind.SELF]: 0.1,
}

// Severity ladder matches the contract: 0 none .. 5 critical.
const SEVERITY_MODIFIER: Record<number, number> = {
  0: 1.0,
  1: 0.95,
  2: 0.85,
  3: 0.7,
  4: 0.5,
  5: 0.3,
}

const SECONDS_PER_DAY = 86_400
const RECENCY_HALF_LIFE_DAYS = 365

/**
 * Score per attestation that "looks like 100" after normalization:
 *   weight 1000 × kind 1.0 × severity 1.0 × recency 1.0 = 1000.
 * Two such rows hit 2000; the divisor below maps "two clean fresh audits
 * from a max-weight auditor" to 100 on the gauge.
 */
const NORMALIZATION_DIVISOR = 2000

const recencyDecay = (
  attestedAt: bigint,
  nowSeconds: number,
): number => {
  const ageSeconds = Math.max(0, nowSeconds - Number(attestedAt))
  const ageDays = ageSeconds / SECONDS_PER_DAY
  return Math.pow(2, -ageDays / RECENCY_HALF_LIFE_DAYS)
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const initialKindBreakdown = (): Record<AttestationKind, number> => ({
  [AttestationKind.AUDIT]: 0,
  [AttestationKind.FUZZ]: 0,
  [AttestationKind.FORMAL]: 0,
  [AttestationKind.BUG_BOUNTY]: 0,
  [AttestationKind.SELF]: 0,
})

export const computeTrustScore = (
  attestations: AttestationWithAuditor[],
  options?: { now?: Date },
): TrustScoreBreakdown => {
  const nowSeconds = Math.floor((options?.now ?? new Date()).getTime() / 1000)

  let totalWeighted = 0
  let highestWeight = 0
  let highestWeightedAuditor: string | null = null
  let hasCriticalFinding = false
  let attestationCount = 0
  const kindBreakdown = initialKindBreakdown()

  for (const a of attestations) {
    // Skip revoked rows entirely. They are preserved on-chain for
    // provenance but must not contribute to the score.
    if (a.revoked) continue

    // Expired rows are equivalent to "no attestation" for current score
    // purposes. They still appear in `<AttestationBadge>` so users can see
    // historical signal, but they don't push the gauge.
    if (a.expiresAt !== 0n && Number(a.expiresAt) <= nowSeconds) continue

    attestationCount += 1
    kindBreakdown[a.kind] = (kindBreakdown[a.kind] ?? 0) + 1

    if (a.severityFound >= 4) hasCriticalFinding = true

    const weight = a.auditor?.active ? a.auditor.weight : 0
    if (weight === 0) {
      // Unknown / inactive auditor still increments the count and the
      // critical-finding flag (someone reported it), but contributes
      // nothing to the trust score. This is what the auditor registry
      // is for — turning "anyone can attest" into "weighted by who".
      continue
    }

    const kindMultiplier = KIND_MULTIPLIER[a.kind] ?? 0
    const severityModifier =
      SEVERITY_MODIFIER[a.severityFound] ??
      // Unknown severity values clamp toward conservative — half credit.
      0.5
    const decay = recencyDecay(a.attestedAt, nowSeconds)

    const contribution = weight * kindMultiplier * severityModifier * decay
    totalWeighted += contribution

    if (weight > highestWeight && a.auditor) {
      highestWeight = weight
      highestWeightedAuditor = a.auditor.name
    }
  }

  const raw = (totalWeighted / NORMALIZATION_DIVISOR) * 100
  const score = clamp(Math.round(raw), 0, 100)

  return {
    score,
    attestationCount,
    kindBreakdown,
    highestWeightedAuditor,
    hasCriticalFinding,
  }
}

export const attestationKindLabel = (kind: AttestationKind): string => {
  switch (kind) {
    case AttestationKind.AUDIT:
      return 'Audit'
    case AttestationKind.FUZZ:
      return 'Fuzz'
    case AttestationKind.FORMAL:
      return 'Formal'
    case AttestationKind.BUG_BOUNTY:
      return 'Bug bounty'
    case AttestationKind.SELF:
      return 'Self'
    default:
      return 'Unknown'
  }
}

export const auditorTierLabel = (tier: AuditorTier): string => {
  switch (tier) {
    case AuditorTier.FIRST_PARTY:
      return 'First party'
    case AuditorTier.INDEPENDENT:
      return 'Independent'
    case AuditorTier.COMMUNITY:
      return 'Community'
    default:
      return 'Unknown'
  }
}

export const severityLabel = (severityFound: number): string => {
  switch (severityFound) {
    case 0:
      return 'No findings'
    case 1:
      return 'Info'
    case 2:
      return 'Low'
    case 3:
      return 'Medium'
    case 4:
      return 'High'
    case 5:
      return 'Critical'
    default:
      return `Severity ${severityFound}`
  }
}
