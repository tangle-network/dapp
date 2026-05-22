import {
  AttestationKind,
  AuditorTier,
  computeTrustScore,
  type AttestationWithAuditor,
} from './trustScore';

/**
 * Regression coverage for `computeTrustScore`.
 *
 * Each test names the specific user-visible signal it locks down. If a
 * code change here flips a score band, the corresponding UI band (green
 * / amber / muted) flips with it — so these tests double as the contract
 * for what numbers the gauge will show.
 */

const NOW = new Date('2026-05-22T00:00:00Z');
const dayInSeconds = 86_400;
const secondsAgo = (days: number): bigint =>
  BigInt(Math.floor(NOW.getTime() / 1000) - days * dayInSeconds);

const auditor = (overrides: Partial<AttestationWithAuditor['auditor']> = {}) => ({
  name: 'Test Auditor',
  metadataUri: '',
  weight: 1000,
  tier: AuditorTier.INDEPENDENT,
  active: true,
  admittedAt: 0n,
  ...overrides,
});

const row = (
  overrides: Partial<AttestationWithAuditor> = {},
): AttestationWithAuditor => ({
  attester: '0x1111111111111111111111111111111111111111',
  reportHash:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  reportUri: 'ipfs://x',
  kind: AttestationKind.AUDIT,
  severityFound: 0,
  attestedAt: secondsAgo(0),
  expiresAt: 0n,
  revoked: false,
  auditor: auditor(),
  ...overrides,
});

describe('computeTrustScore', () => {
  it('returns score 0 for empty input', () => {
    const result = computeTrustScore([], { now: NOW });
    expect(result.score).toBe(0);
    expect(result.attestationCount).toBe(0);
    expect(result.hasCriticalFinding).toBe(false);
    expect(result.highestWeightedAuditor).toBeNull();
  });

  it('saturates near 100 for two fresh clean max-weight audits', () => {
    const result = computeTrustScore(
      [
        row({ attester: '0xa1' as `0x${string}` }),
        row({
          attester: '0xa2' as `0x${string}`,
          auditor: auditor({ name: 'Auditor B' }),
        }),
      ],
      { now: NOW },
    );
    // Two rows of 1000 × 1.0 × 1.0 × 1.0 = 2000 → 100/100.
    expect(result.score).toBe(100);
    expect(result.attestationCount).toBe(2);
    expect(result.hasCriticalFinding).toBe(false);
  });

  it('ignores revoked rows entirely', () => {
    const result = computeTrustScore(
      [
        row({ revoked: true }),
        row({ revoked: true, severityFound: 5 }),
      ],
      { now: NOW },
    );
    expect(result.score).toBe(0);
    expect(result.attestationCount).toBe(0);
    // Revoked critical finding still does NOT flip the flag — it has no
    // bearing on present-day trust.
    expect(result.hasCriticalFinding).toBe(false);
  });

  it('ignores expired rows for score but tracks them via attestationCount when in-window', () => {
    // expired well in the past — fully ignored
    const result = computeTrustScore(
      [
        row({ expiresAt: secondsAgo(1) }), // expired 1 day ago
      ],
      { now: NOW },
    );
    expect(result.score).toBe(0);
    expect(result.attestationCount).toBe(0);
  });

  it('flips hasCriticalFinding on severity 4 or 5 only', () => {
    expect(
      computeTrustScore([row({ severityFound: 3 })], { now: NOW })
        .hasCriticalFinding,
    ).toBe(false);
    expect(
      computeTrustScore([row({ severityFound: 4 })], { now: NOW })
        .hasCriticalFinding,
    ).toBe(true);
    expect(
      computeTrustScore([row({ severityFound: 5 })], { now: NOW })
        .hasCriticalFinding,
    ).toBe(true);
  });

  it('applies kind multipliers — FORMAL > AUDIT > FUZZ > BUG_BOUNTY > SELF', () => {
    const single = (kind: AttestationKind) =>
      computeTrustScore([row({ kind })], { now: NOW }).score;

    const formal = single(AttestationKind.FORMAL);
    const audit = single(AttestationKind.AUDIT);
    const fuzz = single(AttestationKind.FUZZ);
    const bounty = single(AttestationKind.BUG_BOUNTY);
    const self = single(AttestationKind.SELF);

    expect(formal).toBeGreaterThan(audit);
    expect(audit).toBeGreaterThan(fuzz);
    expect(fuzz).toBeGreaterThan(bounty);
    expect(bounty).toBeGreaterThan(self);
  });

  it('applies recency decay (half-life 365 days)', () => {
    const fresh = computeTrustScore([row({ attestedAt: secondsAgo(0) })], {
      now: NOW,
    }).score;
    const oneYear = computeTrustScore(
      [row({ attestedAt: secondsAgo(365) })],
      { now: NOW },
    ).score;
    // 2^(-1) = 0.5 → score halves
    expect(oneYear).toBeLessThanOrEqual(Math.ceil(fresh / 2) + 1);
    expect(oneYear).toBeGreaterThanOrEqual(Math.floor(fresh / 2) - 1);
  });

  it('treats unknown / inactive auditors as zero weight (no contribution)', () => {
    const unknown = computeTrustScore([row({ auditor: null })], {
      now: NOW,
    });
    const inactive = computeTrustScore(
      [row({ auditor: auditor({ active: false }) })],
      { now: NOW },
    );
    expect(unknown.score).toBe(0);
    expect(inactive.score).toBe(0);
    // …but they still show up in the row count + kindBreakdown.
    expect(unknown.attestationCount).toBe(1);
    expect(inactive.attestationCount).toBe(1);
  });

  it('names the highest-weighted auditor', () => {
    const result = computeTrustScore(
      [
        row({
          attester: '0xa1' as `0x${string}`,
          auditor: auditor({ name: 'Lower', weight: 200 }),
        }),
        row({
          attester: '0xa2' as `0x${string}`,
          auditor: auditor({ name: 'Higher', weight: 800 }),
        }),
        row({
          attester: '0xa3' as `0x${string}`,
          auditor: auditor({ name: 'Middle', weight: 500 }),
        }),
      ],
      { now: NOW },
    );
    expect(result.highestWeightedAuditor).toBe('Higher');
  });

  it('high-severity attestation still scores below a clean one', () => {
    const clean = computeTrustScore([row({ severityFound: 0 })], {
      now: NOW,
    }).score;
    const high = computeTrustScore([row({ severityFound: 4 })], {
      now: NOW,
    }).score;
    expect(high).toBeLessThan(clean);
  });

  it('counts kinds in the breakdown for footer display', () => {
    const result = computeTrustScore(
      [
        row({ kind: AttestationKind.AUDIT, attester: '0xa1' as `0x${string}` }),
        row({ kind: AttestationKind.AUDIT, attester: '0xa2' as `0x${string}` }),
        row({ kind: AttestationKind.FUZZ, attester: '0xa3' as `0x${string}` }),
      ],
      { now: NOW },
    );
    expect(result.kindBreakdown[AttestationKind.AUDIT]).toBe(2);
    expect(result.kindBreakdown[AttestationKind.FUZZ]).toBe(1);
    expect(result.kindBreakdown[AttestationKind.SELF]).toBe(0);
  });
});
