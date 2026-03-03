/**
 * Hooks for slashing lifecycle:
 * - List proposals
 * - Propose/dispute/execute/cancel slashes
 * - Discover executable proposals
 * - Build UI guardrails and timeline states
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { Address, type Hash, isAddress, zeroAddress } from 'viem';
import TANGLE_ABI from '../../abi/tangle';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';
import useContractWrite, {
  TxStatus as ContractTxStatus,
} from '../../hooks/useContractWrite';

export const SLASH_EXECUTION_BUFFER_SECONDS = 15;

// Slash status enum
export type SlashStatus = 'Pending' | 'Executed' | 'Cancelled' | 'Disputed';
export type SlashProposerRole =
  | 'ServiceOwner'
  | 'BlueprintOwner'
  | 'SlashingOrigin'
  | 'Unknown';
export type SlashFilterScope = 'operator' | 'proposer' | 'actor' | 'all';

export type SlashTimelineState = 'done' | 'current' | 'upcoming' | 'skipped';
export type SlashTimelineStageKey =
  | 'proposed'
  | 'dispute_window'
  | 'disputed'
  | 'executed'
  | 'cancelled';

export interface SlashTimelineStage {
  key: SlashTimelineStageKey;
  label: string;
  state: SlashTimelineState;
  timestamp: bigint | null;
  description: string;
}

// Slash proposal structure
export interface SlashProposal {
  id: bigint;
  serviceId: bigint;
  operator: Address;
  proposer: Address;
  proposerRole: SlashProposerRole;
  slashBps: bigint;
  effectiveSlashBps: bigint;
  // Backwards-compatible aliases. Slash values are in bps, not token units.
  amount: bigint;
  effectiveAmount: bigint;
  evidence: `0x${string}`;
  proposedAt: bigint;
  executeAfter: bigint;
  status: SlashStatus;
  disputeReason: string | null;
  cancelReason: string | null;
}

export interface ProposableService {
  serviceId: bigint;
  blueprintId: bigint;
  serviceOwner: Address;
  blueprintOwner: Address | null;
  blueprintName: string;
  operatorCandidates: Address[];
}

export interface SlashDisputeEligibility {
  isEligible: boolean;
  reason: 'NotPending' | 'DeadlinePassed' | null;
  secondsUntilDeadline: number;
}

export interface SlashExecutionEligibility {
  isEligible: boolean;
  reason: 'NotPending' | 'Disputed' | 'DisputeWindowOpen' | null;
  secondsUntilExecutable: number;
}

export interface SlashActionPermissions {
  canDispute: boolean;
  disputeReason: string | null;
  canExecute: boolean;
  executeReason: string | null;
  canCancel: boolean;
  cancelReason: string | null;
}

export interface SlashActionPermissionInput {
  slash: Pick<SlashProposal, 'status' | 'executeAfter' | 'operator'>;
  connectedAddress?: Address;
  nowUnixSeconds?: number;
  /**
   * If undefined, action stays visible and chain enforces authorization.
   * If false, action is disabled in UI with an explicit reason.
   */
  isAdmin?: boolean;
}

// Raw response from GraphQL
interface SlashProposalsResponse {
  SlashProposal: Array<{
    id: string;
    slashId: string;
    serviceId: string;
    operator: { id: string } | null;
    proposer: string;
    service: {
      owner: string;
      blueprint: {
        owner: string;
      } | null;
    } | null;
    slashBps: string;
    effectiveSlashBps: string;
    evidence: string;
    createdAt: string;
    executeAfter: string;
    status: string;
    disputeReason: string | null;
    cancelReason: string | null;
  }>;
}

interface ProposableServicesResponse {
  Service: Array<{
    serviceId: string;
    owner: string;
    request: {
      operatorCandidates: string[];
    } | null;
    blueprint: {
      blueprintId: string;
      owner: string;
      metadataUri: string | null;
    } | null;
  }>;
}

interface SlashFilterOptions {
  scope: SlashFilterScope;
  address?: Address;
  statuses?: SlashStatus[];
}

// Parse slash status from string or numeric enum value.
const parseSlashStatus = (status: string | number | bigint): SlashStatus => {
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

const getSlashProposerRole = (
  proposer: string,
  service: SlashProposalsResponse['SlashProposal'][number]['service'],
): SlashProposerRole => {
  if (!service) {
    return 'Unknown';
  }

  const proposerLower = proposer.toLowerCase();
  if (proposerLower === service.owner.toLowerCase()) {
    return 'ServiceOwner';
  }

  if (
    service.blueprint &&
    proposerLower === service.blueprint.owner.toLowerCase()
  ) {
    return 'BlueprintOwner';
  }

  // If proposer is not service/blueprint owner, the contract auth model treats it
  // as slashing-origin authority (manager or custom origin returned by manager).
  return 'SlashingOrigin';
};

const toHexByte = (value: number): string =>
  value.toString(16).padStart(2, '0');

/**
 * Normalize user evidence into bytes32:
 * - Accepts canonical bytes32 hex (`0x` + 64 hex chars)
 * - Accepts plain text (<= 32 bytes), right-padded with zeros
 */
export const toSlashEvidenceBytes32 = (
  evidenceInput: string,
): { value: `0x${string}` | null; error: string | null } => {
  const trimmed = evidenceInput.trim();
  if (trimmed.length === 0) {
    return { value: null, error: 'Evidence is required.' };
  }

  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    if (trimmed.length !== 66) {
      return {
        value: null,
        error: 'Hex evidence must be exactly 32 bytes (0x + 64 hex chars).',
      };
    }

    return { value: trimmed.toLowerCase() as `0x${string}`, error: null };
  }

  const bytes = new TextEncoder().encode(trimmed);
  if (bytes.length > 32) {
    return {
      value: null,
      error: 'Text evidence must be at most 32 bytes.',
    };
  }

  let hex = '';
  for (const value of bytes) {
    hex += toHexByte(value);
  }

  const paddedHex = hex.padEnd(64, '0');
  return { value: `0x${paddedHex}` as `0x${string}`, error: null };
};

/**
 * Converts slash basis points (bps) to a percentage string.
 * Example: 250 => "2.5%"
 */
export const formatSlashBps = (
  bps: bigint | number,
  maxFractionDigits = 2,
): string => {
  const value = typeof bps === 'bigint' ? Number(bps) : bps;
  if (!Number.isFinite(value)) {
    return '0%';
  }

  const percentage = value / 100;
  return `${percentage.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  })}%`;
};

/**
 * Returns seconds remaining until dispute deadline.
 * Positive: time left, 0/negative: deadline reached or passed.
 */
export const getSlashDeadlineTimeRemainingSeconds = (
  executeAfter: bigint,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): number => Number(executeAfter) - nowUnixSeconds;

/**
 * Determines whether a slash is disputable right now.
 * Contract rule: status must be Pending and current time must be before executeAfter.
 */
export const getSlashDisputeEligibility = (
  slash: Pick<SlashProposal, 'status' | 'executeAfter'>,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): SlashDisputeEligibility => {
  if (slash.status !== 'Pending') {
    return {
      isEligible: false,
      reason: 'NotPending',
      secondsUntilDeadline: getSlashDeadlineTimeRemainingSeconds(
        slash.executeAfter,
        nowUnixSeconds,
      ),
    };
  }

  const secondsUntilDeadline = getSlashDeadlineTimeRemainingSeconds(
    slash.executeAfter,
    nowUnixSeconds,
  );

  if (secondsUntilDeadline <= 0) {
    return {
      isEligible: false,
      reason: 'DeadlinePassed',
      secondsUntilDeadline,
    };
  }

  return {
    isEligible: true,
    reason: null,
    secondsUntilDeadline,
  };
};

export const isSlashDisputeEligible = (
  slash: Pick<SlashProposal, 'status' | 'executeAfter'>,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): boolean => getSlashDisputeEligibility(slash, nowUnixSeconds).isEligible;

/**
 * Determines whether a slash is executable now.
 * Contract rule: status must be Pending and timestamp must be >= executeAfter + 15s.
 */
export const getSlashExecutionEligibility = (
  slash: Pick<SlashProposal, 'status' | 'executeAfter'>,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): SlashExecutionEligibility => {
  if (slash.status === 'Disputed') {
    return {
      isEligible: false,
      reason: 'Disputed',
      secondsUntilExecutable:
        getSlashDeadlineTimeRemainingSeconds(
          slash.executeAfter,
          nowUnixSeconds,
        ) + SLASH_EXECUTION_BUFFER_SECONDS,
    };
  }

  if (slash.status !== 'Pending') {
    return {
      isEligible: false,
      reason: 'NotPending',
      secondsUntilExecutable:
        getSlashDeadlineTimeRemainingSeconds(
          slash.executeAfter,
          nowUnixSeconds,
        ) + SLASH_EXECUTION_BUFFER_SECONDS,
    };
  }

  const secondsUntilExecutable =
    Number(slash.executeAfter) +
    SLASH_EXECUTION_BUFFER_SECONDS -
    nowUnixSeconds;

  if (secondsUntilExecutable > 0) {
    return {
      isEligible: false,
      reason: 'DisputeWindowOpen',
      secondsUntilExecutable,
    };
  }

  return {
    isEligible: true,
    reason: null,
    secondsUntilExecutable,
  };
};

export const getSlashActionPermissions = ({
  slash,
  connectedAddress,
  isAdmin,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
}: SlashActionPermissionInput): SlashActionPermissions => {
  const disputeEligibility = getSlashDisputeEligibility(slash, nowUnixSeconds);
  const executionEligibility = getSlashExecutionEligibility(
    slash,
    nowUnixSeconds,
  );

  const isOperator =
    connectedAddress !== undefined &&
    connectedAddress.toLowerCase() === slash.operator.toLowerCase();

  const canDisputeByRole = isOperator || isAdmin === true;

  const canDispute = disputeEligibility.isEligible && canDisputeByRole;
  const disputeReason = !canDispute
    ? canDisputeByRole
      ? disputeEligibility.reason === 'DeadlinePassed'
        ? 'Dispute window closed.'
        : 'Slash is not pending.'
      : 'Only the slashed operator (or slash admin) can dispute.'
    : null;

  const canExecute = executionEligibility.isEligible;
  const executeReason = !canExecute
    ? executionEligibility.reason === 'DisputeWindowOpen'
      ? `Dispute window still open. Executable after ${new Date(Number(slash.executeAfter) * 1000).toLocaleString()}.`
      : executionEligibility.reason === 'Disputed'
        ? 'Disputed slashes cannot be executed.'
        : 'Slash is not pending.'
    : null;

  const canCancelByRole = isAdmin !== false;
  const cancelAllowedByStatus =
    slash.status === 'Pending' || slash.status === 'Disputed';

  const canCancel = cancelAllowedByStatus && canCancelByRole;
  const cancelReason = !canCancel
    ? !cancelAllowedByStatus
      ? 'Only pending/disputed slashes can be cancelled.'
      : 'Admin role required.'
    : null;

  return {
    canDispute,
    disputeReason,
    canExecute,
    executeReason,
    canCancel,
    cancelReason,
  };
};

export const buildSlashTimeline = (
  slash: Pick<SlashProposal, 'status' | 'proposedAt' | 'executeAfter'>,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): SlashTimelineStage[] => {
  const disputeEligibility = getSlashDisputeEligibility(slash, nowUnixSeconds);
  const executionEligibility = getSlashExecutionEligibility(
    slash,
    nowUnixSeconds,
  );

  const proposed: SlashTimelineStage = {
    key: 'proposed',
    label: 'Proposed',
    state: 'done',
    timestamp: slash.proposedAt,
    description: 'Slash proposal created on-chain.',
  };

  const disputeWindow: SlashTimelineStage = {
    key: 'dispute_window',
    label: 'Dispute Window',
    state:
      slash.status === 'Pending' && disputeEligibility.isEligible
        ? 'current'
        : 'done',
    timestamp: slash.executeAfter,
    description:
      slash.status === 'Pending' && disputeEligibility.isEligible
        ? 'Dispute window is still open.'
        : 'Dispute window elapsed or slash moved to terminal state.',
  };

  const disputed: SlashTimelineStage = {
    key: 'disputed',
    label: 'Disputed',
    state:
      slash.status === 'Disputed'
        ? 'current'
        : slash.status === 'Cancelled' || slash.status === 'Executed'
          ? 'skipped'
          : 'upcoming',
    timestamp: null,
    description:
      slash.status === 'Disputed'
        ? 'Proposal is currently under dispute.'
        : slash.status === 'Cancelled'
          ? 'Proposal was cancelled.'
          : slash.status === 'Executed'
            ? 'No dispute was filed before execution.'
            : 'No dispute filed yet.',
  };

  const executed: SlashTimelineStage = {
    key: 'executed',
    label: 'Executed',
    state:
      slash.status === 'Executed'
        ? 'current'
        : slash.status === 'Cancelled'
          ? 'skipped'
          : 'upcoming',
    timestamp: null,
    description:
      slash.status === 'Executed'
        ? 'Slash execution completed.'
        : executionEligibility.isEligible
          ? 'Ready for execution.'
          : 'Awaiting execution conditions.',
  };

  const cancelled: SlashTimelineStage = {
    key: 'cancelled',
    label: 'Cancelled',
    state:
      slash.status === 'Cancelled'
        ? 'current'
        : slash.status === 'Executed'
          ? 'skipped'
          : 'upcoming',
    timestamp: null,
    description:
      slash.status === 'Cancelled'
        ? 'Slash proposal cancelled.'
        : 'Not cancelled.',
  };

  return [proposed, disputeWindow, disputed, executed, cancelled];
};

const toPrimitiveSlashProposal = (
  sp: SlashProposalsResponse['SlashProposal'][number],
): SlashProposal => {
  const slashBps = BigInt(sp.slashBps);
  const effectiveSlashBps = BigInt(sp.effectiveSlashBps);

  return {
    id: BigInt(sp.slashId),
    serviceId: BigInt(sp.serviceId),
    operator: (sp.operator?.id ?? zeroAddress) as Address,
    proposer: sp.proposer as Address,
    proposerRole: getSlashProposerRole(sp.proposer, sp.service),
    slashBps,
    effectiveSlashBps,
    amount: slashBps,
    effectiveAmount: effectiveSlashBps,
    evidence: sp.evidence as `0x${string}`,
    proposedAt: BigInt(sp.createdAt),
    executeAfter: BigInt(sp.executeAfter),
    status: parseSlashStatus(sp.status),
    disputeReason: sp.disputeReason,
    cancelReason: sp.cancelReason,
  };
};

const buildSlashWhereClause = ({
  scope,
  address,
}: SlashFilterOptions): string => {
  if (!address || scope === 'all') {
    return '';
  }

  if (scope === 'operator') {
    return 'where: { operator: { id: { _eq: $address } } }';
  }

  if (scope === 'proposer') {
    return 'where: { proposer: { _eq: $address } }';
  }

  // actor
  return `
    where: {
      _or: [
        { operator: { id: { _eq: $address } } }
        { proposer: { _eq: $address } }
      ]
    }
  `;
};

// Fetch slash proposals with configurable scope.
const fetchSlashProposals = async (
  options: SlashFilterOptions,
  network?: EnvioNetwork,
): Promise<SlashProposal[]> => {
  const whereClause = buildSlashWhereClause(options);
  const usesAddressFilter = whereClause.trim().length > 0 && !!options.address;

  const query = usesAddressFilter
    ? gql`
        query GetSlashProposalsByAddress($address: String!) {
          SlashProposal(
            ${whereClause}
            order_by: { createdAt: desc }
          ) {
            id
            slashId
            serviceId
            operator {
              id
            }
            proposer
            service {
              owner
              blueprint {
                owner
              }
            }
            slashBps: amount
            effectiveSlashBps: effectiveAmount
            evidence
            createdAt
            executeAfter
            status
            disputeReason
            cancelReason
          }
        }
      `
    : gql`
        query GetSlashProposalsAll {
          SlashProposal(order_by: { createdAt: desc }) {
            id
            slashId
            serviceId
            operator {
              id
            }
            proposer
            service {
              owner
              blueprint {
                owner
              }
            }
            slashBps: amount
            effectiveSlashBps: effectiveAmount
            evidence
            createdAt
            executeAfter
            status
            disputeReason
            cancelReason
          }
        }
      `;

  const result = await executeEnvioGraphQL<
    SlashProposalsResponse,
    { address?: string }
  >(
    query,
    usesAddressFilter && options.address
      ? { address: options.address.toLowerCase() }
      : undefined,
    network,
  );

  if (result.errors?.length) {
    throw new Error(
      `Failed to fetch slash proposals: ${result.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  let proposals = (result.data.SlashProposal ?? []).map(
    toPrimitiveSlashProposal,
  );

  if (options.statuses && options.statuses.length > 0) {
    const allowed = new Set(options.statuses);
    proposals = proposals.filter((proposal) => allowed.has(proposal.status));
  }

  return proposals;
};

const fetchProposableServices = async (
  address: Address,
  network?: EnvioNetwork,
): Promise<ProposableService[]> => {
  const query = gql`
    query GetProposableServices($address: String!) {
      Service(
        where: {
          status: { _eq: "ACTIVE" }
          _or: [
            { owner: { _eq: $address } }
            { blueprint: { owner: { _eq: $address } } }
          ]
        }
        order_by: { createdAt: desc }
      ) {
        serviceId
        owner
        request {
          operatorCandidates
        }
        blueprint {
          blueprintId
          owner
          metadataUri
        }
      }
    }
  `;

  const response = await executeEnvioGraphQL<
    ProposableServicesResponse,
    { address: string }
  >(query, { address: address.toLowerCase() }, network);

  if (response.errors?.length) {
    throw new Error(
      `Failed to fetch proposable services: ${response.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  return (response.data.Service ?? []).map((service) => {
    const blueprintId = BigInt(service.blueprint?.blueprintId ?? '0');

    return {
      serviceId: BigInt(service.serviceId),
      blueprintId,
      serviceOwner: service.owner as Address,
      blueprintOwner: service.blueprint?.owner
        ? (service.blueprint.owner as Address)
        : null,
      blueprintName: `Blueprint #${blueprintId.toString()}`,
      operatorCandidates: (service.request?.operatorCandidates ?? [])
        .filter((value): value is Address => isAddress(value))
        .map((value) => value as Address),
    };
  });
};

const normalizeOnChainSlashProposal = (
  slashId: bigint,
  proposal: any,
): SlashProposal => {
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
  const proposedAt = BigInt(
    proposal?.proposedAt?.toString() ?? proposal?.[6]?.toString() ?? 0,
  );
  const executeAfter = BigInt(
    proposal?.executeAfter?.toString() ?? proposal?.[7]?.toString() ?? 0,
  );
  const statusValue = proposal?.status ?? proposal?.[8] ?? 0;
  const disputeReason = (proposal?.disputeReason ?? proposal?.[9] ?? null) as
    | string
    | null;

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
  };
};

/**
 * Hook to fetch slash proposals with lifecycle-aware filtering.
 */
export const useSlashProposals = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
  scope?: SlashFilterScope;
  address?: Address;
  statuses?: SlashStatus[];
}) => {
  const {
    network,
    enabled = true,
    scope = 'operator',
    statuses,
  } = options ?? {};
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);
  const resolvedAddress = options?.address ?? address;

  const shouldFetch =
    enabled && (scope === 'all' || resolvedAddress !== undefined);

  return useQuery({
    queryKey: [
      'slashing',
      'proposals',
      resolvedNetwork,
      scope,
      resolvedAddress ?? null,
      statuses?.join(',') ?? null,
    ],
    queryFn: async () => {
      return fetchSlashProposals(
        {
          scope,
          address: resolvedAddress,
          statuses,
        },
        resolvedNetwork,
      );
    },
    enabled: shouldFetch,
    staleTime: 30_000,
  });
};

/**
 * Hook to fetch services where the active account can plausibly propose slash
 * (service owner or blueprint owner).
 */
export const useProposableServices = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
  address?: Address;
}) => {
  const { network, enabled = true } = options ?? {};
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);
  const resolvedAddress = options?.address ?? address;

  return useQuery({
    queryKey: [
      'slashing',
      'proposableServices',
      resolvedNetwork,
      resolvedAddress,
    ],
    queryFn: async () => {
      if (!resolvedAddress) return [];
      return fetchProposableServices(resolvedAddress, resolvedNetwork);
    },
    enabled: enabled && !!resolvedAddress,
    staleTime: 30_000,
  });
};

/**
 * Reads an on-chain slash proposal directly from the Tangle contract.
 */
export const useSlashProposalDetails = (
  slashId: bigint | undefined,
  options?: { enabled?: boolean },
) => {
  const { enabled = true } = options ?? {};
  const chainId = useChainId();
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['slashing', 'proposalDetails', chainId, slashId?.toString()],
    queryFn: async () => {
      if (slashId === undefined) return null;
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const contracts = getContractsByChainId(chainId);

      const proposal = await publicClient.readContract({
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'getSlashProposal',
        args: [slashId],
      });

      return normalizeOnChainSlashProposal(slashId, proposal);
    },
    enabled: enabled && slashId !== undefined && !!publicClient,
    staleTime: 15_000,
  });
};

/**
 * Reads executable slash IDs directly from the contract.
 */
export const useExecutableSlashes = (options?: {
  fromId?: bigint;
  toId?: bigint;
  proposals?: SlashProposal[];
  enabled?: boolean;
}) => {
  const { enabled = true, proposals } = options ?? {};
  const chainId = useChainId();
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: [
      'slashing',
      'executable',
      chainId,
      options?.fromId?.toString() ?? null,
      options?.toId?.toString() ?? null,
      proposals?.length ?? 0,
      proposals
        ?.map((proposal) => proposal.id.toString())
        .slice(0, 20)
        .join(',') ?? null,
    ],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      let fromId = options?.fromId;
      let toId = options?.toId;

      if (fromId === undefined || toId === undefined) {
        if (!proposals || proposals.length === 0) {
          return [] as bigint[];
        }

        let maxId = BigInt(0);
        for (const proposal of proposals) {
          if (proposal.id > maxId) {
            maxId = proposal.id;
          }
        }

        fromId = BigInt(0);
        toId = maxId + BigInt(1);
      }

      if (toId <= fromId) {
        return [] as bigint[];
      }

      const contracts = getContractsByChainId(chainId);
      const ids = await publicClient.readContract({
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'getExecutableSlashes',
        args: [fromId, toId],
      });

      return (ids as Array<bigint | number>).map((value) =>
        BigInt(value.toString()),
      );
    },
    enabled: enabled && !!publicClient,
    staleTime: 10_000,
  });
};

// Transaction status
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

interface SlashReasonParams {
  slashId: bigint;
  reason: string;
}

interface ProposeSlashParams {
  serviceId: bigint;
  operator: Address;
  slashBps: number;
  evidence: `0x${string}`;
}

interface ProposeSlashResult {
  hash: Hash;
  slashId?: bigint;
  proposal?: SlashProposal;
}

interface ExecuteSlashParams {
  slashId: bigint;
}

interface ExecuteSlashBatchParams {
  slashIds: bigint[];
}

const mapContractWriteStatus = (status: ContractTxStatus): TxStatus => {
  switch (status) {
    case ContractTxStatus.PROCESSING:
      return 'pending';
    case ContractTxStatus.COMPLETE:
      return 'success';
    case ContractTxStatus.ERROR:
      return 'error';
    default:
      return 'idle';
  }
};

const parseSimulatedSlashId = (value: unknown): bigint | undefined => {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return BigInt(value);
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return BigInt(value);
  }

  return undefined;
};

/**
 * Hook to propose a slash.
 */
export const useProposeSlashTx = () => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ProposeSlashParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'proposeSlash' as const,
        args: [
          params.serviceId,
          params.operator,
          params.slashBps,
          params.evidence,
        ] as const,
      };
    },
    {
      txName: 'propose slash',
      txDetails: (params) =>
        new Map([
          ['Service ID', params.serviceId.toString()],
          ['Operator', params.operator],
          ['Slash BPS', params.slashBps.toString()],
        ]),
      getSuccessMessage: () => 'Slash proposal submitted successfully.',
    },
  );

  const proposeSlash = async (
    serviceId: bigint,
    operator: Address,
    slashBps: number,
    evidence: `0x${string}`,
  ): Promise<ProposeSlashResult | null> => {
    const result = await hook.execute?.({
      serviceId,
      operator,
      slashBps,
      evidence,
    });
    if (!result) {
      return null;
    }

    const slashId = parseSimulatedSlashId(result.simulatedResult);
    if (slashId === undefined || !publicClient) {
      return {
        hash: result.hash,
        slashId,
      };
    }

    try {
      const contracts = getContractsByChainId(chainId);
      const proposal = await publicClient.readContract({
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'getSlashProposal',
        args: [slashId],
      });

      return {
        hash: result.hash,
        slashId,
        proposal: normalizeOnChainSlashProposal(slashId, proposal),
      };
    } catch {
      return {
        hash: result.hash,
        slashId,
      };
    }
  };

  return {
    proposeSlash,
    status: mapContractWriteStatus(hook.status),
    error: hook.error,
    reset: hook.reset,
  };
};

/**
 * Hook to dispute a slash proposal.
 */
export const useDisputeSlashTx = () => {
  const chainId = useChainId();
  const hook = useContractWrite(
    TANGLE_ABI,
    (params: SlashReasonParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'disputeSlash' as const,
        args: [params.slashId, params.reason] as const,
      };
    },
    {
      txName: 'dispute slash',
      txDetails: (params) => new Map([['Slash ID', params.slashId.toString()]]),
      getSuccessMessage: (params) =>
        `Slash #${params.slashId} disputed successfully`,
    },
  );

  const disputeSlash = async (
    slashId: bigint,
    reason: string,
  ): Promise<Hash | null> => {
    const result = await hook.execute?.({ slashId, reason });
    return result?.hash ?? null;
  };

  return {
    disputeSlash,
    status: mapContractWriteStatus(hook.status),
    error: hook.error,
    reset: hook.reset,
  };
};

/**
 * Hook to execute a slash proposal.
 */
export const useExecuteSlashTx = () => {
  const chainId = useChainId();
  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ExecuteSlashParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'executeSlash' as const,
        args: [params.slashId] as const,
      };
    },
    {
      txName: 'execute slash',
      txDetails: (params) => new Map([['Slash ID', params.slashId.toString()]]),
      getSuccessMessage: (params) =>
        `Slash #${params.slashId} executed successfully`,
    },
  );

  const executeSlash = async (slashId: bigint): Promise<Hash | null> => {
    const result = await hook.execute?.({ slashId });
    return result?.hash ?? null;
  };

  return {
    executeSlash,
    status: mapContractWriteStatus(hook.status),
    error: hook.error,
    reset: hook.reset,
  };
};

/**
 * Hook to execute a batch of slash proposals.
 */
export const useExecuteSlashBatchTx = () => {
  const chainId = useChainId();
  const hook = useContractWrite(
    TANGLE_ABI,
    (params: ExecuteSlashBatchParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'executeSlashBatch' as const,
        args: [params.slashIds] as const,
      };
    },
    {
      txName: 'execute slash batch',
      txDetails: (params) =>
        new Map([['Slash Count', params.slashIds.length.toString()]]),
      getSuccessMessage: (params) =>
        `Submitted batch execution for ${params.slashIds.length} slash proposal(s).`,
    },
  );

  const executeSlashBatch = async (
    slashIds: bigint[],
  ): Promise<Hash | null> => {
    if (slashIds.length === 0) {
      return null;
    }

    const result = await hook.execute?.({ slashIds });
    return result?.hash ?? null;
  };

  return {
    executeSlashBatch,
    status: mapContractWriteStatus(hook.status),
    error: hook.error,
    reset: hook.reset,
  };
};

/**
 * Hook to cancel a slash proposal.
 */
export const useCancelSlashTx = () => {
  const chainId = useChainId();
  const hook = useContractWrite(
    TANGLE_ABI,
    (params: SlashReasonParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'cancelSlash' as const,
        args: [params.slashId, params.reason] as const,
      };
    },
    {
      txName: 'cancel slash',
      txDetails: (params) => new Map([['Slash ID', params.slashId.toString()]]),
      getSuccessMessage: (params) =>
        `Slash #${params.slashId} cancelled successfully`,
    },
  );

  const cancelSlash = async (
    slashId: bigint,
    reason: string,
  ): Promise<Hash | null> => {
    const result = await hook.execute?.({ slashId, reason });
    return result?.hash ?? null;
  };

  return {
    cancelSlash,
    status: mapContractWriteStatus(hook.status),
    error: hook.error,
    reset: hook.reset,
  };
};

/**
 * Format slash amount for display.
 */
export const formatSlashAmount = (amount: bigint, decimals = 18): string => {
  // Calculate divisor without using exponentiation operator
  let divisor = BigInt(1);
  for (let i = 0; i < decimals; i++) {
    divisor *= BigInt(10);
  }
  const whole = amount / divisor;
  const fractional = amount % divisor;
  const fractionalStr = fractional
    .toString()
    .padStart(decimals, '0')
    .slice(0, 4);
  return `${whole}.${fractionalStr}`;
};

export default useSlashProposals;
