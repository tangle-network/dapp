/**
 * Revision-aware binary-version / attestation decode coverage.
 *
 * tnt-core 0.19 dropped the URI blobs from the on-chain STORAGE structs:
 * `Types.BinaryVersion` lost `binaryUri` and `Types.Attestation` lost
 * `reportUri` (both now event-sourced). `useBinaryVersions` picks the read ABI
 * by revision and the normalizers accept the URI slot as optional. These tests
 * pin that: v019 tuples decode with a `null` URI and never throw, while the
 * legacy/v018 tuples still surface the full URI.
 */

import {
  binaryReadAbiFor,
  normalizeAttestation,
  normalizeBinaryVersion,
} from './binaryVersion';

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
    blueprintAuditors: '0x0000000000000000000000000000000000000002',
  }),
}));

const SHA =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const ATT_HASH =
  '0x2222222222222222222222222222222222222222222222222222222222222222';
const REPORT_HASH =
  '0x3333333333333333333333333333333333333333333333333333333333333333';
const ATTESTER = '0x4444444444444444444444444444444444444444';

describe('binaryReadAbiFor', () => {
  it('selects the URI-bearing default ABI for legacy and v018', () => {
    const legacy = binaryReadAbiFor(1);
    const v018 = binaryReadAbiFor(18);
    expect(v018).toBe(legacy);
    // The default ABI is a large multi-function array.
    expect(legacy.length).toBeGreaterThan(4);
  });

  it('selects the shorter no-URI read ABI for v019', () => {
    const v019 = binaryReadAbiFor(19);
    const legacy = binaryReadAbiFor(1);
    expect(v019).not.toBe(legacy);
    // The v019 read fragment is exactly the four struct-returning views.
    expect(v019).toHaveLength(4);
    const getBinaryVersion = (v019 as ReadonlyArray<{ name: string }>).find(
      (fn) => fn.name === 'getBinaryVersion',
    ) as {
      outputs: [{ components: { name: string }[] }];
    };
    const componentNames = getBinaryVersion.outputs[0].components.map(
      (c) => c.name,
    );
    expect(componentNames).not.toContain('binaryUri');
  });
});

describe('normalizeBinaryVersion', () => {
  it('nulls binaryUri on the v019 tuple without throwing', () => {
    const result = normalizeBinaryVersion({
      versionId: 3n,
      sha256Hash: SHA,
      // binaryUri absent — the 0.19 struct dropped it.
      attestationHash: ATT_HASH,
      publishedAt: 1_700n,
      deprecated: false,
    });
    expect(result.versionId).toBe(3n);
    expect(result.sha256Hash).toBe(SHA);
    expect(result.binaryUri).toBeNull();
    expect(result.attestationHash).toBe(ATT_HASH);
    expect(result.publishedAt).toBe(1_700n);
    expect(result.deprecated).toBe(false);
  });

  it('preserves binaryUri on the full legacy/v018 tuple', () => {
    const result = normalizeBinaryVersion({
      versionId: 3n,
      sha256Hash: SHA,
      binaryUri: 'ipfs://binary',
      attestationHash: ATT_HASH,
      publishedAt: 1_700n,
      deprecated: true,
    });
    expect(result.binaryUri).toBe('ipfs://binary');
    expect(result.deprecated).toBe(true);
  });
});

describe('normalizeAttestation', () => {
  it('nulls reportUri on the v019 tuple without throwing', () => {
    const result = normalizeAttestation({
      attester: ATTESTER,
      reportHash: REPORT_HASH,
      // reportUri absent — the 0.19 struct dropped it.
      kind: 0,
      severityFound: 1,
      attestedAt: 1_800n,
      expiresAt: 0n,
      revoked: false,
    });
    expect(result.attester).toBe(ATTESTER);
    expect(result.reportHash).toBe(REPORT_HASH);
    expect(result.reportUri).toBeNull();
    expect(result.severityFound).toBe(1);
    expect(result.attestedAt).toBe(1_800n);
    expect(result.revoked).toBe(false);
  });

  it('preserves reportUri on the full legacy/v018 tuple', () => {
    const result = normalizeAttestation({
      attester: ATTESTER,
      reportHash: REPORT_HASH,
      reportUri: 'ipfs://report',
      kind: 0,
      severityFound: 0,
      attestedAt: 1_800n,
      expiresAt: 0n,
      revoked: false,
    });
    expect(result.reportUri).toBe('ipfs://report');
  });
});
