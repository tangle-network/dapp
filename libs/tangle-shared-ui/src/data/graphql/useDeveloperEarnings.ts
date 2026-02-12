/**
 * Hooks for developer earnings data.
 *
 * Current product state:
 * - Developer payouts are direct on-chain transfers.
 * - Exact developer payout ledger is not yet indexed for frontend queries.
 * - This hook therefore reports an explicit `unavailable` state instead of
 *   returning estimated/fabricated earnings values.
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount, useChainId } from 'wagmi';
import { Address, formatUnits } from 'viem';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';

// Retained for forward compatibility with a future exact payout ledger.
export interface BlueprintEarnings {
  blueprintId: bigint;
  blueprintName: string;
  totalEarned: bigint;
  pendingEarnings: bigint;
  claimedEarnings: bigint;
  serviceCount: number;
  jobCount: number;
  lastEarningAt: bigint | null;
}

// Retained for forward compatibility with a future exact payout ledger.
export interface EarningEvent {
  id: string;
  blueprintId: bigint;
  serviceId: bigint;
  amount: bigint;
  token: Address;
  timestamp: bigint;
  type: 'subscription' | 'job' | 'registration';
}

// Retained for forward compatibility with a future exact payout ledger.
export interface DeveloperEarningsSummary {
  totalEarned: bigint;
  pendingEarnings: bigint;
  claimedEarnings: bigint;
  blueprintCount: number;
  totalServiceCount: number;
  totalJobCount: number;
}

export interface DeveloperEarningsAvailableState {
  state: 'available';
  summary: DeveloperEarningsSummary;
  blueprints: BlueprintEarnings[];
}

export interface DeveloperEarningsUnavailableState {
  state: 'unavailable';
  reason: 'not_indexed';
  message: string;
  owner: Address;
  blueprintCount: number;
  blueprintIds: bigint[];
}

export type DeveloperEarningsData =
  | DeveloperEarningsAvailableState
  | DeveloperEarningsUnavailableState;

export type DeveloperEarningsState = 'available' | 'unavailable' | 'error';

interface OwnedBlueprintsResponse {
  Blueprint: Array<{
    blueprintId: string;
  }>;
}

const throwIfGraphQLErrors = (
  errors: Array<{ message: string }> | undefined,
  context: string,
) => {
  if (!errors || errors.length === 0) {
    return;
  }

  const message = errors.map((error) => error.message).join('; ');
  throw new Error(`${context}: ${message}`);
};

const fetchDeveloperEarnings = async (
  owner: Address,
  network: EnvioNetwork,
): Promise<DeveloperEarningsData> => {
  const blueprintsQuery = `
    query GetDeveloperBlueprints($owner: String!) {
      Blueprint(where: { owner: { _eq: $owner } }) {
        blueprintId
      }
    }
  `;

  const blueprintsResult = await executeEnvioGraphQL<
    OwnedBlueprintsResponse,
    { owner: string }
  >(blueprintsQuery, { owner: owner.toLowerCase() }, network);

  throwIfGraphQLErrors(
    blueprintsResult.errors,
    'Failed to fetch developer blueprints',
  );

  const blueprintIds = (blueprintsResult.data.Blueprint ?? []).map((blueprint) =>
    BigInt(blueprint.blueprintId),
  );

  return {
    state: 'unavailable',
    reason: 'not_indexed',
    message:
      'Exact developer payout events are not indexed yet for earnings aggregation. Showing estimates is disabled to avoid misleading financial data.',
    owner,
    blueprintCount: blueprintIds.length,
    blueprintIds,
  };
};

/**
 * Hook to fetch developer earnings with truth-first state handling.
 */
export const useDeveloperEarnings = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const { address } = useAccount();
  const chainId = useChainId();
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(chainId);

  const query = useQuery({
    queryKey: ['developer', 'earnings', address, resolvedNetwork],
    queryFn: async () => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      return fetchDeveloperEarnings(address, resolvedNetwork);
    },
    enabled: enabled && !!address,
    staleTime: 60_000, // 1 minute
  });

  const state: DeveloperEarningsState = query.error
    ? 'error'
    : (query.data?.state ?? 'unavailable');

  return {
    ...query,
    state,
    network: resolvedNetwork,
  };
};

/**
 * Format earnings amount for display.
 */
export const formatEarningsAmount = (amount: bigint, decimals = 18): string => {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
};

export default useDeveloperEarnings;
