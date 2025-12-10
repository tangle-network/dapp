/**
 * EVM hook for fetching user statistics from the Envio indexer.
 */

import { useMemo } from 'react';
import { Address } from 'viem';
import {
  useServicesByOwner,
  usePendingServiceRequests,
} from '@tangle-network/tangle-shared-ui/data/graphql';

export interface UserStats {
  runningServices: number;
  deployedServices: number;
  pendingServices: number;
  consumedServices: number;
}

/**
 * Hook to fetch user statistics for an EVM address.
 */
export const useUserStats = (
  userAddress: Address | undefined,
  _refreshTrigger?: number,
) => {
  // Fetch services owned by user
  const {
    data: ownedServices,
    isLoading: isLoadingOwned,
    refetch: refetchOwned,
  } = useServicesByOwner(userAddress);

  // Fetch pending service requests by user
  const {
    data: pendingRequests,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = usePendingServiceRequests(userAddress);

  const result = useMemo<UserStats>(() => {
    const activeServices =
      ownedServices?.filter((s) => s.status === 'ACTIVE') ?? [];
    const allDeployed = ownedServices ?? [];
    const pendingCount = pendingRequests?.length ?? 0;

    return {
      runningServices: activeServices.length,
      deployedServices: allDeployed.length,
      pendingServices: pendingCount,
      consumedServices: 0, // TODO: Query services where user is a permitted caller
    };
  }, [ownedServices, pendingRequests]);

  const refetch = async () => {
    await Promise.all([refetchOwned(), refetchPending()]);
  };

  return {
    result,
    isLoading: isLoadingOwned || isLoadingPending,
    refetch,
  };
};

export default useUserStats;
