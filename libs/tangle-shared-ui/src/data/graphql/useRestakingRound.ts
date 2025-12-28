/**
 * Hook to fetch the current restaking round from the Envio indexer.
 * Replaces the Substrate-based useRestakeCurrentRound hook.
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount, useChainId } from 'wagmi';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';

// Restaking round type
export interface RestakingRound {
  id: string;
  round: bigint;
  blockNumber: bigint;
  timestamp: bigint;
}

// GraphQL query for the latest restaking round (Hasura uses PascalCase + order_by)
const RESTAKING_ROUND_QUERY = gql`
  query RestakingRounds {
    RestakingRound(limit: 1, order_by: { round: desc }) {
      id
      round
      blockNumber
      timestamp
    }
  }
`;

interface RestakingRoundQueryResult {
  RestakingRound: Array<{
    id: string;
    round: string;
    blockNumber: string;
    timestamp: string;
  }>;
}

// Parse restaking round from GraphQL response
const parseRestakingRound = (
  raw: RestakingRoundQueryResult['RestakingRound'][number],
): RestakingRound => ({
  id: raw.id,
  round: BigInt(raw.round),
  blockNumber: BigInt(raw.blockNumber),
  timestamp: BigInt(raw.timestamp),
});

// Fetch the current restaking round
const fetchCurrentRound = async (
  network?: EnvioNetwork,
): Promise<RestakingRound | null> => {
  const result = await executeEnvioGraphQL<
    RestakingRoundQueryResult,
    Record<string, never>
  >(RESTAKING_ROUND_QUERY, {}, network);

  const rounds = result.data.RestakingRound ?? [];
  return rounds.length > 0 ? parseRestakingRound(rounds[0]) : null;
};

// Hook to fetch the current restaking round
export const useRestakingRound = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  return useQuery({
    queryKey: ['envio', 'restakingRound', resolvedNetwork],
    queryFn: () => fetchCurrentRound(resolvedNetwork),
    enabled,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });
};

// Hook to get just the current round number
export const useCurrentRoundNumber = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { data: round, ...rest } = useRestakingRound(options);

  return {
    ...rest,
    data: round?.round ?? null,
  };
};
