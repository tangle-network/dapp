/**
 * Hook to fetch the current restaking round from the Envio indexer.
 * Replaces the Substrate-based useRestakeCurrentRound hook.
 */

import { useQuery } from '@tanstack/react-query';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

// Restaking round type
export interface RestakingRound {
  id: string;
  round: bigint;
  blockNumber: bigint;
  timestamp: bigint;
}

// GraphQL query for the latest restaking round
const RESTAKING_ROUND_QUERY = gql`
  query RestakingRounds {
    restakingRounds(first: 1, orderBy: round) {
      id
      round
      blockNumber
      timestamp
    }
  }
`;

interface RestakingRoundQueryResult {
  restakingRounds: Array<{
    id: string;
    round: string;
    blockNumber: string;
    timestamp: string;
  }>;
}

// Parse restaking round from GraphQL response
const parseRestakingRound = (
  raw: RestakingRoundQueryResult['restakingRounds'][number],
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

  const rounds = result.data.restakingRounds;
  return rounds.length > 0 ? parseRestakingRound(rounds[0]) : null;
};

// Hook to fetch the current restaking round
export const useRestakingRound = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'restakingRound', network],
    queryFn: () => fetchCurrentRound(network),
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
