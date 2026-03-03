/**
 * Hook to fetch the current staking round from the Envio indexer.
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

export interface StakingRound {
  id: string;
  round: bigint;
  blockNumber: bigint;
  timestamp: bigint;
}

const STAKING_ROUND_QUERY = gql`
  query StakingRounds {
    StakingRound(limit: 1, order_by: { round: desc }) {
      id
      round
      blockNumber
      timestamp
    }
  }
`;

interface StakingRoundQueryResult {
  StakingRound: Array<{
    id: string;
    round: string;
    blockNumber: string;
    timestamp: string;
  }>;
}

const parseStakingRound = (
  raw: StakingRoundQueryResult['StakingRound'][number],
): StakingRound => ({
  id: raw.id,
  round: BigInt(raw.round),
  blockNumber: BigInt(raw.blockNumber),
  timestamp: BigInt(raw.timestamp),
});

const fetchCurrentRound = async (
  network?: EnvioNetwork,
): Promise<StakingRound | null> => {
  const result = await executeEnvioGraphQL<
    StakingRoundQueryResult,
    Record<string, never>
  >(STAKING_ROUND_QUERY, {}, network);

  const rounds = result.data.StakingRound ?? [];
  return rounds.length > 0 ? parseStakingRound(rounds[0]) : null;
};

export const useStakingRound = (options?: {
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
    queryKey: ['envio', 'stakingRound', resolvedNetwork],
    queryFn: () => fetchCurrentRound(resolvedNetwork),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
};

export const useCurrentRoundNumber = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { data: round, ...rest } = useStakingRound(options);

  return {
    ...rest,
    data: round?.round ?? null,
  };
};

export default useStakingRound;
