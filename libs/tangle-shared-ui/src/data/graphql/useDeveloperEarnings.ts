/**
 * Backward-compatible developer earnings hook built from exact payout ledger data.
 *
 * This wrapper keeps the existing hook API while sourcing values from
 * `DeveloperPayment` indexer entities.
 */

import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import { Address } from 'viem';
import {
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import {
  useDeveloperPayments,
  formatEarningsAmount,
} from './useDeveloperPayments';

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

export interface EarningEvent {
  id: string;
  blueprintId: bigint;
  serviceId: bigint;
  amount: bigint;
  token: Address;
  timestamp: bigint;
  type: 'subscription' | 'job' | 'registration';
}

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

export const useDeveloperEarnings = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
  limit?: number;
}) => {
  const chainId = useChainId();
  const resolvedNetwork =
    options?.network ?? getEnvioNetworkFromChainId(chainId);
  const query = useDeveloperPayments(options);

  const data = useMemo<DeveloperEarningsData | undefined>(() => {
    if (!query.data) {
      return undefined;
    }

    const blueprints: BlueprintEarnings[] = query.data.blueprintRollups.map(
      (rollup) => ({
        blueprintId: rollup.blueprintId,
        blueprintName: `Blueprint #${rollup.blueprintId.toString()}`,
        totalEarned: rollup.totalPaid,
        pendingEarnings: BigInt(0),
        claimedEarnings: rollup.totalPaid,
        serviceCount: rollup.serviceCount,
        jobCount: 0,
        lastEarningAt: rollup.lastPaidAt,
      }),
    );

    return {
      state: 'available',
      summary: {
        totalEarned: query.data.totalPayoutAmount,
        pendingEarnings: BigInt(0),
        claimedEarnings: query.data.totalPayoutAmount,
        blueprintCount: blueprints.length,
        totalServiceCount: query.data.serviceCount,
        totalJobCount: 0,
      },
      blueprints,
    };
  }, [query.data]);

  const state: DeveloperEarningsState = query.error
    ? 'error'
    : data
      ? 'available'
      : 'unavailable';

  return {
    ...query,
    data,
    state,
    network: resolvedNetwork,
  };
};

export { formatEarningsAmount };

export default useDeveloperEarnings;
