import { useActiveChain } from '@tangle-network/api-provider-environment/hooks/useActiveChain';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ReactQueryKey } from '../../constants/reactQuery';
import { LoggerService } from '@tangle-network/browser-utils';
import { BN } from '@polkadot/util';
import { useApiPromiseQuery } from '@tangle-network/tangle-shared-ui/hooks/useApiPromiseQuery';
import { ApiPromise } from '@polkadot/api';

const logger = LoggerService.new('useGitHubCredits');

// This represents the structure of our credits data
export type GitHubCreditsData = {
  amount: BN;
  githubUsername?: string;
};

export default function useGitHubCredits() {
  const activeSubstrateAddress = useSubstrateAddress(false);
  const { network } = useNetworkStore();
  const [activeChain] = useActiveChain();
  const rpcEndpoints = useNetworkStore(
    (store) => store.network2?.wsRpcEndpoints,
  );

  const { data: apiPromise } = useApiPromiseQuery(rpcEndpoints);

  // Use archive RPC endpoint if available
  const overrideRpcEndpoint = useMemo(() => {
    const wsEndpoints = activeChain?.rpcUrls.default?.webSocket;

    if (wsEndpoints && wsEndpoints.length > 0) {
      return wsEndpoints[0];
    }

    return network?.archiveRpcEndpoint ?? network.wsRpcEndpoints[0];
  }, [
    activeChain?.rpcUrls.default?.webSocket,
    network?.archiveRpcEndpoint,
    network.wsRpcEndpoints,
  ]);

  return useQuery(
    getQueryOptions(overrideRpcEndpoint, activeSubstrateAddress, apiPromise),
  );
}

export function getQueryOptions(
  rpcEndpoint: string,
  activeSubstrateAddress: string | null,
  api: ApiPromise | undefined,
) {
  return queryOptions({
    queryKey: [
      ReactQueryKey.GetGitHubCredits,
      rpcEndpoint,
      activeSubstrateAddress,
    ],
    queryFn: async () => {
      if (!activeSubstrateAddress || !api) {
        return null;
      }

      try {
        // For now, we're simulating this by returning a fixed amount
        // In reality, we would fetch this from the chain or from an indexer
        // that keeps track of credit balances

        // This simulates having 100 TNT worth of credits from staking
        return {
          amount: new BN('100000000000000'),
          githubUsername: '',
        };
      } catch (error) {
        logger.error('Error fetching GitHub credits', error);
        throw error;
      }
    },
    retry: 3,
    refetchInterval: 30000, // Refetch every 30 seconds
    placeholderData: (prev) => prev,
  });
}
