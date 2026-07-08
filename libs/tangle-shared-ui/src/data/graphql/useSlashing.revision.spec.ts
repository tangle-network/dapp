/**
 * Revision-aware `getSlashProposal` decode coverage.
 *
 * tnt-core 0.19 slimmed the on-chain `SlashProposal` struct: it dropped
 * `proposedAt`, `disputeReason`, and `disputedAt`. So legacy/v018 chains return
 * a 14-field tuple and v019 chains return an 11-field tuple. `useSlashing`
 * selects the read ABI by revision and `normalizeOnChainSlashProposal` walks the
 * two positional layouts. A one-index slip here (e.g. reading `executeAfter`
 * from slot 7 on a v019 tuple where it lives at slot 6) silently shows wrong
 * dispute/execution deadlines in the UI — these tests pin both layouts.
 */

// Control the per-chain revision the hook module reads.
import {
  normalizeOnChainSlashProposal,
  slashProposalReadAbiFor,
} from './slashProposal';

const revisionByChainId: Record<number, 'legacy' | 'v018' | 'v019'> = {
  1: 'legacy',
  18: 'v018',
  19: 'v019',
};

jest.mock('@tangle-network/dapp-config/contracts', () => ({
  __esModule: true,
  getTntCoreRevisionByChainId: (chainId: number) =>
    revisionByChainId[chainId] ?? 'legacy',
  getContractsByChainId: () => ({
    tangle: '0x0000000000000000000000000000000000000001',
  }),
}));

const OPERATOR = '0x1111111111111111111111111111111111111111';
const PROPOSER = '0x2222222222222222222222222222222222222222';
const DISPUTER = '0x3333333333333333333333333333333333333333';
const EVIDENCE =
  '0x00000000000000000000000000000000000000000000000000000000000000ab';

/**
 * Full pre-0.19 (legacy / v018) named-tuple shape as viem decodes it against
 * the 14-field `GET_SLASH_PROPOSAL_V018_ABI`.
 */
const v018Named = {
  serviceId: 7n,
  operator: OPERATOR,
  proposer: PROPOSER,
  slashBps: 250n,
  effectiveSlashBps: 200n,
  evidence: EVIDENCE,
  proposedAt: 1_000n,
  executeAfter: 2_000n,
  status: 0, // Pending
  disputeReason: 'because',
  disputer: DISPUTER,
  disputeBond: 42n,
  disputedAt: 1_500n,
  disputeDeadline: 3_000n,
};

/**
 * Short 0.19 named-tuple shape as viem decodes it against the synced
 * `TANGLE_ABI` — `proposedAt`, `disputeReason`, and `disputedAt` are gone.
 */
const v019Named = {
  serviceId: 7n,
  operator: OPERATOR,
  proposer: PROPOSER,
  slashBps: 250n,
  effectiveSlashBps: 200n,
  evidence: EVIDENCE,
  executeAfter: 2_000n,
  status: 0,
  disputer: DISPUTER,
  disputeBond: 42n,
  disputeDeadline: 3_000n,
};

describe('slashProposalReadAbiFor', () => {
  it('selects the full-tuple fragment for legacy and v018', () => {
    const legacy = slashProposalReadAbiFor(1);
    const v018 = slashProposalReadAbiFor(18);
    // The v018 fragment carries the dropped fields; assert the tuple length.
    const legacyOutputs = (
      legacy[0] as { outputs: [{ components: unknown[] }] }
    ).outputs[0].components;
    expect(legacyOutputs).toHaveLength(14);
    expect(v018).toBe(legacy);
  });

  it('selects the synced short-tuple ABI for v019', () => {
    const v019 = slashProposalReadAbiFor(19);
    // The synced ABI is a large multi-function array, not the 1-entry fragment.
    expect(v019.length).toBeGreaterThan(1);
  });
});

describe('normalizeOnChainSlashProposal', () => {
  it('decodes the full legacy/v018 tuple including proposedAt and disputedAt', () => {
    const result = normalizeOnChainSlashProposal(5n, v018Named, 'v018');
    expect(result.id).toBe(5n);
    expect(result.serviceId).toBe(7n);
    expect(result.operator).toBe(OPERATOR);
    expect(result.slashBps).toBe(250n);
    expect(result.effectiveSlashBps).toBe(200n);
    expect(result.evidence).toBe(EVIDENCE);
    expect(result.proposedAt).toBe(1_000n);
    expect(result.executeAfter).toBe(2_000n);
    expect(result.status).toBe('Pending');
    expect(result.disputeReason).toBe('because');
    expect(result.disputer).toBe(DISPUTER);
    expect(result.disputeBond).toBe(42n);
    expect(result.disputedAt).toBe(1_500n);
    expect(result.disputeDeadline).toBe(3_000n);
  });

  it('decodes the short v019 tuple with dropped fields defaulted, not misaligned', () => {
    const result = normalizeOnChainSlashProposal(5n, v019Named, 'v019');
    // Fields present on v019 must survive.
    expect(result.serviceId).toBe(7n);
    expect(result.executeAfter).toBe(2_000n);
    expect(result.disputer).toBe(DISPUTER);
    expect(result.disputeBond).toBe(42n);
    expect(result.disputeDeadline).toBe(3_000n);
    expect(result.status).toBe('Pending');
    // Dropped-on-v019 fields default rather than reading a shifted slot.
    expect(result.proposedAt).toBe(0n);
    expect(result.disputeReason).toBeNull();
    expect(result.disputedAt).toBe(0n);
  });

  it('reads the v019 positional tuple without one-index slippage', () => {
    // Positional (array) form as viem returns when component names are absent.
    const positional = [
      7n, // serviceId
      OPERATOR, // operator
      PROPOSER, // proposer
      250n, // slashBps
      200n, // effectiveSlashBps
      EVIDENCE, // evidence
      2_000n, // executeAfter (slot 6 on v019; slot 7 on v018)
      0, // status
      DISPUTER, // disputer
      42n, // disputeBond
      3_000n, // disputeDeadline
    ];
    const result = normalizeOnChainSlashProposal(9n, positional, 'v019');
    expect(result.executeAfter).toBe(2_000n);
    expect(result.disputer).toBe(DISPUTER);
    expect(result.disputeBond).toBe(42n);
    expect(result.disputeDeadline).toBe(3_000n);
    expect(result.proposedAt).toBe(0n);
    expect(result.disputedAt).toBe(0n);
  });
});
