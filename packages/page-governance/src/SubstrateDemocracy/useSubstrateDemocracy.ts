import {
  randBetweenDate,
  randBrand,
  randEthereumAddress,
  randGitCommitMessage,
  randNumber,
  randPastDate,
  randProductDescription,
  randSoonDate,
} from '@ngneat/falso';
import { useCallback, useMemo, useState } from 'react';

import { ProposalStatus } from '../types';
import { useSeedProposals } from '../useSeedProposals';

export interface IProposal {
  author: string;
  address: string;
  title: string;
  voteId: number;
  status: ProposalStatus;
  endTime: number;
  totalVotes: number;
  description?: string;
}

export interface IProposalResponse {
  data: Array<IProposal>;
  offset: number;
  limit: number;
  total: number;
}

export function useSubstrateDemocracy() {
  const [response, setResponse] = useState<IProposalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /** Seeding data */
  const deplayTimeMs = useMemo(() => 1000, []);
  const seededData = useSeedProposals();
  const totalItems = useMemo(() => seededData.length, [seededData]);
  const seededActiveData = useMemo(() => {
    return seededData.filter((proposal) => proposal.status === 'active');
  }, [seededData]);

  const fetchAllProposals = useCallback(
    (offset: number = 0, limit: number = 5) => {
      setIsLoading(true);

      return new Promise<void>(() =>
        setTimeout(() => {
          setResponse({
            data: seededData.slice(offset, offset + limit),
            limit,
            offset,
            total: totalItems,
          });
          setIsLoading(false);
        }, deplayTimeMs)
      );
    },
    [deplayTimeMs, seededData, totalItems]
  );

  const fetchActiveProposals = useCallback(
    (offset: number = 0, limit: number = 5) => {
      setIsLoading(true);

      return new Promise<void>(() =>
        setTimeout(() => {
          setResponse({
            data: seededActiveData.slice(offset, offset + limit),
            limit,
            offset,
            total: seededActiveData.length,
          });
          setIsLoading(false);
        }, deplayTimeMs)
      );
    },
    [deplayTimeMs, seededActiveData]
  );

  return {
    response,
    fetchActiveProposals,
    fetchAllProposals,
    isLoading,
  };
}
