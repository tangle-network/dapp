/**
 * Pure (wagmi-free) slash-proposal decode + ABI selection.
 *
 * These pieces are split out of `useSlashing.ts` so they can be unit-tested
 * without pulling wagmi/react-query (ESM) into the jest module graph. The hook
 * module re-exports everything here, so consumers importing from `useSlashing`
 * (or the `graphql` barrel) see no change.
 *
 * tnt-core 0.19 slimmed the on-chain `SlashProposal` struct — it dropped
 * `proposedAt`, `disputeReason`, and `disputedAt` (reconstructable off-chain
 * from the `SlashProposed` / `SlashDisputed` event blocks). So legacy/v018
 * chains return the full 14-field tuple and v019 chains return an 11-field
 * tuple; the read ABI and the positional decode below must branch on revision
 * or every field after `evidence` mis-aligns.
 */

import type { Address } from 'viem';
import { zeroAddress } from 'viem';
import {
  getTntCoreRevisionByChainId,
  type TntCoreRevision,
} from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';

export type SlashStatus = 'Pending' | 'Executed' | 'Cancelled' | 'Disputed';
export type SlashProposerRole =
  | 'ServiceOwner'
  | 'BlueprintOwner'
  | 'SlashingOrigin'
  | 'Unknown';

export interface SlashProposal {
  id: bigint;
  serviceId: bigint;
  operator: Address;
  proposer: Address;
  proposerRole: SlashProposerRole;
  slashBps: bigint;
  effectiveSlashBps: bigint;
  amount: bigint;
  effectiveAmount: bigint;
  evidence: `0x${string}`;
  proposedAt: bigint;
  executeAfter: bigint;
  status: SlashStatus;
  disputeReason: string | null;
  cancelReason: string | null;
  disputer: Address;
  disputeBond: bigint;
  disputedAt: bigint;
  disputeDeadline: bigint;
}

export const parseSlashStatus = (
  status: string | number | bigint,
): SlashStatus => {
  if (typeof status === 'number' || typeof status === 'bigint') {
    switch (Number(status)) {
      case 1:
        return 'Disputed';
      case 2:
        return 'Executed';
      case 3:
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }

  switch (status.toLowerCase()) {
    case 'executed':
      return 'Executed';
    case 'cancelled':
      return 'Cancelled';
    case 'disputed':
      return 'Disputed';
    default:
      return 'Pending';
  }
};

/**
 * Full (pre-0.19) `getSlashProposal` return tuple. The synced `TANGLE_ABI`
 * carries the SHORT 0.19 tuple, so legacy/v018 chains must decode
 * `getSlashProposal` with this full-tuple ABI or every field after `evidence`
 * mis-aligns.
 */
export const GET_SLASH_PROPOSAL_V018_ABI = [
  {
    type: 'function',
    name: 'getSlashProposal',
    stateMutability: 'view',
    inputs: [{ name: 'slashId', type: 'uint64', internalType: 'uint64' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct SlashingLib.SlashProposal',
        components: [
          { name: 'serviceId', type: 'uint64', internalType: 'uint64' },
          { name: 'operator', type: 'address', internalType: 'address' },
          { name: 'proposer', type: 'address', internalType: 'address' },
          { name: 'slashBps', type: 'uint16', internalType: 'uint16' },
          { name: 'effectiveSlashBps', type: 'uint16', internalType: 'uint16' },
          { name: 'evidence', type: 'bytes32', internalType: 'bytes32' },
          { name: 'proposedAt', type: 'uint64', internalType: 'uint64' },
          { name: 'executeAfter', type: 'uint64', internalType: 'uint64' },
          {
            name: 'status',
            type: 'uint8',
            internalType: 'enum SlashingLib.SlashStatus',
          },
          { name: 'disputeReason', type: 'string', internalType: 'string' },
          { name: 'disputer', type: 'address', internalType: 'address' },
          { name: 'disputeBond', type: 'uint256', internalType: 'uint256' },
          { name: 'disputedAt', type: 'uint64', internalType: 'uint64' },
          { name: 'disputeDeadline', type: 'uint64', internalType: 'uint64' },
        ],
      },
    ],
  },
] as const;

/**
 * Selects the ABI for the `getSlashProposal` READ by revision. v019 uses the
 * synced (short-tuple) `TANGLE_ABI`; legacy/v018 use the full-tuple fragment.
 */
export const slashProposalReadAbiFor = (chainId: number) =>
  getTntCoreRevisionByChainId(chainId) === 'v019'
    ? TANGLE_ABI
    : GET_SLASH_PROPOSAL_V018_ABI;

export const normalizeOnChainSlashProposal = (
  slashId: bigint,
  // viem returns either a named tuple object or a positional array depending on
  // whether the ABI components carry names; accept both shapes.
  proposal: any,
  revision: TntCoreRevision,
): SlashProposal => {
  const isV019 = revision === 'v019';
  const serviceId =
    proposal?.serviceId !== undefined
      ? BigInt(proposal.serviceId.toString())
      : BigInt(proposal?.[0]?.toString() ?? 0);
  const operator = (proposal?.operator ??
    proposal?.[1] ??
    zeroAddress) as Address;
  const proposer = (proposal?.proposer ??
    proposal?.[2] ??
    zeroAddress) as Address;
  const slashBps = BigInt(
    proposal?.slashBps?.toString() ?? proposal?.[3]?.toString() ?? 0,
  );
  const effectiveSlashBps = BigInt(
    proposal?.effectiveSlashBps?.toString() ?? proposal?.[4]?.toString() ?? 0,
  );
  const evidence = (proposal?.evidence ??
    proposal?.[5] ??
    '0x') as `0x${string}`;
  const proposedAt = isV019
    ? BigInt(proposal?.proposedAt?.toString() ?? 0)
    : BigInt(
        proposal?.proposedAt?.toString() ?? proposal?.[6]?.toString() ?? 0,
      );
  const executeAfter = BigInt(
    proposal?.executeAfter?.toString() ??
      (isV019 ? proposal?.[6]?.toString() : proposal?.[7]?.toString()) ??
      0,
  );
  const statusValue =
    proposal?.status ?? (isV019 ? proposal?.[7] : proposal?.[8]) ?? 0;
  const disputeReason = (
    isV019
      ? (proposal?.disputeReason ?? null)
      : (proposal?.disputeReason ?? proposal?.[9] ?? null)
  ) as string | null;
  const disputer = (proposal?.disputer ??
    (isV019 ? proposal?.[8] : proposal?.[10]) ??
    zeroAddress) as Address;
  const disputeBond = BigInt(
    proposal?.disputeBond?.toString() ??
      (isV019 ? proposal?.[9]?.toString() : proposal?.[11]?.toString()) ??
      0,
  );
  const disputedAt = isV019
    ? BigInt(proposal?.disputedAt?.toString() ?? 0)
    : BigInt(
        proposal?.disputedAt?.toString() ?? proposal?.[12]?.toString() ?? 0,
      );
  const disputeDeadline = BigInt(
    proposal?.disputeDeadline?.toString() ??
      (isV019 ? proposal?.[10]?.toString() : proposal?.[13]?.toString()) ??
      0,
  );

  return {
    id: slashId,
    serviceId,
    operator,
    proposer,
    proposerRole: 'Unknown',
    slashBps,
    effectiveSlashBps,
    amount: slashBps,
    effectiveAmount: effectiveSlashBps,
    evidence,
    proposedAt,
    executeAfter,
    status: parseSlashStatus(statusValue),
    disputeReason,
    cancelReason: null,
    disputer,
    disputeBond,
    disputedAt,
    disputeDeadline,
  };
};
