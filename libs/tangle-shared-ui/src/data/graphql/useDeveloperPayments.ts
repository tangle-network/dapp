/**
 * Hooks for exact developer payout ledger data.
 *
 * Data source:
 * - `DeveloperPayment` entities indexed from on-chain `PaymentDistributed` events.
 * - Includes manager payout overrides because recipient is emitted by contract.
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount, useChainId } from 'wagmi';
import { Address, formatUnits } from 'viem';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import {
  DeveloperPaymentRow,
  mapDeveloperPaymentRow,
} from './developerPaymentMapper';

export interface DeveloperPaymentEvent {
  id: string;
  serviceId: bigint;
  blueprintId: bigint;
  recipient: Address;
  token: Address;
  amount: bigint;
  paidAt: bigint;
  txHash: string;
}

export interface DeveloperTokenTotal {
  token: Address;
  totalPaid: bigint;
  paymentCount: number;
}

export interface DeveloperBlueprintRollup {
  blueprintId: bigint;
  totalPaid: bigint;
  paymentCount: number;
  serviceCount: number;
  lastPaidAt: bigint | null;
  tokenTotals: DeveloperTokenTotal[];
}

export interface DeveloperPaymentsData {
  owner: Address;
  events: DeveloperPaymentEvent[];
  totalPayoutAmount: bigint;
  tokenTotals: DeveloperTokenTotal[];
  payoutAddresses: Address[];
  serviceCount: number;
  blueprintRollups: DeveloperBlueprintRollup[];
}

interface DeveloperPaymentsQueryResponse {
  DeveloperPayment: DeveloperPaymentRow[];
}

interface BlueprintAccumulator {
  blueprintId: bigint;
  totalPaid: bigint;
  paymentCount: number;
  lastPaidAt: bigint | null;
  serviceIds: Set<string>;
  tokenTotals: Map<string, DeveloperTokenTotal>;
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

const fetchDeveloperPaymentEvents = async (
  account: Address,
  network: EnvioNetwork,
  limit: number,
): Promise<DeveloperPaymentEvent[]> => {
  const query = `
    query GetDeveloperPayments($account: String!, $limit: Int!) {
      DeveloperPayment(
        where: {
          _or: [
            { recipient: { _eq: $account } }
            { blueprint: { owner: { _eq: $account } } }
          ]
        }
        order_by: { paidAt: desc }
        limit: $limit
      ) {
        id
        serviceId
        blueprintId
        recipient
        token
        amount
        paidAt
        txHash
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    DeveloperPaymentsQueryResponse,
    { account: string; limit: number }
  >(query, { account: account.toLowerCase(), limit }, network);

  throwIfGraphQLErrors(
    result.errors,
    'Failed to fetch developer payment events',
  );

  return (result.data.DeveloperPayment ?? []).map(mapDeveloperPaymentRow);
};

const toSortedTokenTotals = (
  tokenTotalsMap: Map<string, DeveloperTokenTotal>,
): DeveloperTokenTotal[] => {
  return [...tokenTotalsMap.values()].sort((a, b) => {
    if (a.totalPaid === b.totalPaid) {
      return a.token.localeCompare(b.token);
    }
    return a.totalPaid > b.totalPaid ? -1 : 1;
  });
};

const aggregateDeveloperPayments = (
  owner: Address,
  events: DeveloperPaymentEvent[],
): DeveloperPaymentsData => {
  const tokenTotalsMap = new Map<string, DeveloperTokenTotal>();
  const payoutAddresses = new Set<string>();
  const serviceIds = new Set<string>();
  const blueprintAccumulators = new Map<string, BlueprintAccumulator>();

  let totalPayoutAmount = BigInt(0);

  for (const event of events) {
    const tokenKey = event.token.toLowerCase();
    const serviceKey = event.serviceId.toString();
    const blueprintKey = event.blueprintId.toString();
    const recipient = event.recipient.toLowerCase();

    totalPayoutAmount += event.amount;
    payoutAddresses.add(recipient);
    serviceIds.add(serviceKey);

    const tokenTotal = tokenTotalsMap.get(tokenKey);
    if (tokenTotal) {
      tokenTotal.totalPaid += event.amount;
      tokenTotal.paymentCount += 1;
    } else {
      tokenTotalsMap.set(tokenKey, {
        token: event.token,
        totalPaid: event.amount,
        paymentCount: 1,
      });
    }

    const blueprintAccumulator = blueprintAccumulators.get(blueprintKey) ?? {
      blueprintId: event.blueprintId,
      totalPaid: BigInt(0),
      paymentCount: 0,
      lastPaidAt: null,
      serviceIds: new Set<string>(),
      tokenTotals: new Map<string, DeveloperTokenTotal>(),
    };

    blueprintAccumulator.totalPaid += event.amount;
    blueprintAccumulator.paymentCount += 1;
    blueprintAccumulator.serviceIds.add(serviceKey);

    if (
      blueprintAccumulator.lastPaidAt === null ||
      event.paidAt > blueprintAccumulator.lastPaidAt
    ) {
      blueprintAccumulator.lastPaidAt = event.paidAt;
    }

    const blueprintTokenTotal = blueprintAccumulator.tokenTotals.get(tokenKey);
    if (blueprintTokenTotal) {
      blueprintTokenTotal.totalPaid += event.amount;
      blueprintTokenTotal.paymentCount += 1;
    } else {
      blueprintAccumulator.tokenTotals.set(tokenKey, {
        token: event.token,
        totalPaid: event.amount,
        paymentCount: 1,
      });
    }

    blueprintAccumulators.set(blueprintKey, blueprintAccumulator);
  }

  const blueprintRollups: DeveloperBlueprintRollup[] = [
    ...blueprintAccumulators.values(),
  ]
    .map((accumulator) => ({
      blueprintId: accumulator.blueprintId,
      totalPaid: accumulator.totalPaid,
      paymentCount: accumulator.paymentCount,
      serviceCount: accumulator.serviceIds.size,
      lastPaidAt: accumulator.lastPaidAt,
      tokenTotals: toSortedTokenTotals(accumulator.tokenTotals),
    }))
    .sort((a, b) => {
      if (a.totalPaid === b.totalPaid) {
        if (a.blueprintId === b.blueprintId) {
          return 0;
        }
        return a.blueprintId > b.blueprintId ? 1 : -1;
      }
      return a.totalPaid > b.totalPaid ? -1 : 1;
    });

  return {
    owner,
    events,
    totalPayoutAmount,
    tokenTotals: toSortedTokenTotals(tokenTotalsMap),
    payoutAddresses: [...payoutAddresses] as Address[],
    serviceCount: serviceIds.size,
    blueprintRollups,
  };
};

/**
 * Hook to fetch and aggregate developer payout events.
 */
export const useDeveloperPayments = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
  limit?: number;
}) => {
  const { network, enabled = true, limit = 500 } = options ?? {};
  const { address } = useAccount();
  const chainId = useChainId();
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(chainId);

  const query = useQuery({
    queryKey: ['developer', 'payments', address, resolvedNetwork, limit],
    queryFn: async (): Promise<DeveloperPaymentsData> => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const events = await fetchDeveloperPaymentEvents(
        address,
        resolvedNetwork,
        limit,
      );
      return aggregateDeveloperPayments(address, events);
    },
    enabled: enabled && !!address,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  return {
    ...query,
    network: resolvedNetwork,
  };
};

/**
 * Format payout amount for display.
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

export default useDeveloperPayments;
