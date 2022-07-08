import { useCallback, useMemo, useState } from 'react';

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

export function useProposalDetail(voteId: string | undefined) {
  const [response, setResponse] = useState<IProposalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getVoters } = useSeedVoters();

  /** Seeding voters data */
  const deplayTimeMs = useMemo(() => 1000, []);
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
        setResponse({
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
    response,
    fetchVoters,
    isLoading,
  };
}
