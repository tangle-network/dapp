/**
 * Pure (wagmi-free) binary-version / attestation decode + ABI selection.
 *
 * Split out of `useBinaryVersions.ts` so it can be unit-tested without pulling
 * wagmi/react-query (ESM) into the jest module graph. The hook module
 * re-exports these, so consumers see no change.
 *
 * tnt-core 0.19 dropped the URI blobs from the on-chain STORAGE structs:
 * `Types.BinaryVersion` lost `binaryUri` and `Types.Attestation` lost
 * `reportUri` (both now event-sourced). So the v019 read tuples are shorter and
 * must be decoded with the shorter ABI; the normalizers accept the URI slot as
 * optional and default it to `null`.
 */

import type { Address } from 'viem';
import { getTntCoreRevisionByChainId } from '@tangle-network/dapp-config/contracts';
import BinaryUpgradeABI, {
  BINARY_UPGRADE_V019_READ_ABI,
} from '../../abi/tangleBinaryUpgrade';
import type {
  AttestationKind,
  Attestation,
} from '../../blueprintApps/trustScore';

export interface BinaryVersion {
  versionId: bigint;
  sha256Hash: `0x${string}`;
  // tnt-core 0.19 dropped `binaryUri` from the on-chain `BinaryVersion` struct;
  // it is event-sourced from `BinaryVersionPublished`. The normalizer leaves it
  // `null` (the tuple has no URI slot); on v019 the fetchers in
  // `useBinaryVersions` backfill it from the publish log. `null` only when no
  // publish event is found. A non-empty string on legacy/v018 chains that still
  // store it in the returned tuple.
  binaryUri: string | null;
  attestationHash: `0x${string}`;
  publishedAt: bigint;
  deprecated: boolean;
}

/**
 * Selects the read-path ABI for binary-version / attestation struct getters.
 *
 * On v019 the returned tuples dropped their URI slots, so decoding them against
 * the URI-bearing 0.18 tuple mis-aligns every subsequent field. Legacy/v018
 * chains keep the full ABI. The WRITE path always uses `BinaryUpgradeABI` (the
 * URI is still a calldata param on every revision) — this helper only governs
 * the four struct-returning views.
 */
export const binaryReadAbiFor = (chainId: number) =>
  getTntCoreRevisionByChainId(chainId) === 'v019'
    ? BINARY_UPGRADE_V019_READ_ABI
    : BinaryUpgradeABI;

// `binaryUri` is absent from the 0.19 struct returndata. Accept it as optional
// so a single normalizer covers both tuple shapes; missing → `null`.
export const normalizeBinaryVersion = (raw: {
  versionId: bigint;
  sha256Hash: `0x${string}`;
  binaryUri?: string;
  attestationHash: `0x${string}`;
  publishedAt: bigint;
  deprecated: boolean;
}): BinaryVersion => ({
  versionId: BigInt(raw.versionId),
  sha256Hash: raw.sha256Hash,
  binaryUri: raw.binaryUri ?? null,
  attestationHash: raw.attestationHash,
  publishedAt: BigInt(raw.publishedAt),
  deprecated: raw.deprecated,
});

// `reportUri` is absent from the 0.19 attestation struct returndata; missing →
// `null` here. On v019 `fetchAttestations` backfills it from the
// `BinaryVersionAttested.reportUri` log, joined by attester address.
export const normalizeAttestation = (raw: {
  attester: Address;
  reportHash: `0x${string}`;
  reportUri?: string;
  kind: number;
  severityFound: number;
  attestedAt: bigint;
  expiresAt: bigint;
  revoked: boolean;
}): Attestation => ({
  attester: raw.attester,
  reportHash: raw.reportHash,
  reportUri: raw.reportUri ?? null,
  kind: raw.kind as AttestationKind,
  severityFound: raw.severityFound,
  attestedAt: BigInt(raw.attestedAt),
  expiresAt: BigInt(raw.expiresAt),
  revoked: raw.revoked,
});
