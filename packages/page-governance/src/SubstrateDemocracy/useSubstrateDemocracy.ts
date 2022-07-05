import {
  randBetweenDate,
  randBrand,
  randEthereumAddress,
  randGitCommitMessage,
  randNumber,
  randPastDate,
  randSoonDate,
} from '@ngneat/falso';
import { useCallback, useMemo, useState } from 'react';

import { ProposalStatus } from '../types';

export interface IProposal {
  author: string;
  address: string;
  title: string;
  voteId: number;
  status: ProposalStatus;
  endTime: number;
  totalVotes: number;
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
  const totalItems = useMemo(() => randNumber({ min: 20, max: 50 }), []);
  const seededData = useMemo(
    () =>
      Array(totalItems)
        .fill(null)
        .map((_, idx) => {
          const dateMin = randPastDate();
          const dateMax = randSoonDate({ days: 10 });
          const endTime = randBetweenDate({ from: dateMin, to: dateMax }).getTime();

          const status =
            endTime > Date.now()
              ? ('active' as const)
              : ['executed' as const, 'defeated' as const][randNumber({ min: 0, max: 1 })];

          return {
            address: randEthereumAddress(),
            author: randBrand({ length: 5 })[0],
            endTime,
            status,
            title: randGitCommitMessage({ length: randNumber({ min: 5, max: 10 }) })[0],
            totalVotes: randNumber({ min: 100, max: 500 }),
            voteId: idx + 1,
          } as IProposal;
        }),
    [totalItems]
  );
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
