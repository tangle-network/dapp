/**
 * EVM hook for fetching operator statistics from the Envio indexer.
 */

import { useMemo } from 'react';
import { Address } from 'viem';
import {
  useOperator,
  useOperatorStats as useOperatorStatsQuery,
} from '@tangle-network/tangle-shared-ui/data/graphql';

export interface OperatorStats {
  registeredBlueprints: number;
  runningServices: number;
  pendingServices: number;
  avgUptime: number;
  deployedServices: number;
  publishedBlueprints: number;
}

/**
 * Hook to fetch operator statistics for an EVM address.
 */
export const useOperatorStats = (
  operatorAddress: Address | undefined,
  _refreshTrigger?: number,
) => {
  // Fetch operator data from indexer
  const { data: operator, isLoading: isLoadingOperator } =
    useOperator(operatorAddress);

  // Fetch operator stats from indexer
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch,
  } = useOperatorStatsQuery(operatorAddress);

  const result = useMemo<OperatorStats | null>(() => {
    if (!operator) {
      return null;
    }

    return {
      registeredBlueprints: stats?.registeredBlueprints ?? 0,
      runningServices: stats?.runningServices ?? 0,
      pendingServices: stats?.pendingServices ?? 0,
      avgUptime: stats?.avgUptime ?? 0,
      deployedServices: stats?.deployedServices ?? 0,
      publishedBlueprints: stats?.publishedBlueprints ?? 0,
    };
  }, [operator, stats]);

  return {
    result,
    isLoading: isLoadingOperator || isLoadingStats,
    refetch,
  };
};

export default useOperatorStats;
