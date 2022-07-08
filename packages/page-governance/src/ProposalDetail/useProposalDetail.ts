import { useCallback, useMemo, useState } from 'react';

import { IProposal } from '../SubstrateDemocracy';
import { useSeedVoters } from '../useSeedVoters';

export interface IProposalVoter {
  address: string;
  vote: boolean;
  paymentAmount: number;
  paymentTokenSymbol: 'ETH';
}

export interface IProposalDetail {
  data: IProposalVoter[];
  limit: number;
  offset: number;
  total: number;
}

export function useProposalDetail(proposal: IProposal) {
  const { voteId } = proposal;
  const [votersResponse, setVotersResponse] = useState<IProposalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getVoters } = useSeedVoters();

  /** Seeding voters data */
  const deplayTimeMs = useMemo(() => 1000, []);
  const yesVotesAmount = useMemo(() => {
    if (!votersResponse) {
      return 0;
    }

    return votersResponse.data.reduce((acc, cur) => {
      if (cur.vote) {
        acc += 1;
      }
      return acc;
    }, 0);
  }, [votersResponse]);
  const noVotesAmount = useMemo(() => {
    if (!votersResponse) {
      return 0;
    }

    return votersResponse.data.length - yesVotesAmount;
  }, [yesVotesAmount, votersResponse]);

  const fetchVoters = useCallback(
    (offset: number = 0, limit: number = 5) => {
      if (!voteId) {
        return;
      }

      const voters = getVoters(voteId.toString());
      if (!voters) {
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setVotersResponse({
          data: voters.slice(offset, offset + limit),
          limit,
          offset,
          total: voters.length,
        });
        setIsLoading(false);
      }, deplayTimeMs);
    },
    [deplayTimeMs, getVoters, voteId]
  );

  return {
    votersResponse,
    yesVotesAmount,
    noVotesAmount,
    fetchVoters,
    isLoading,
  };
}
