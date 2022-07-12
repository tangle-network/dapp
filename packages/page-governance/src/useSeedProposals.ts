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
import { useMemo } from 'react';

import { IProposal } from './SubstrateDemocracy';

export function useSeedProposals() {
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
            description: randProductDescription({ length: randNumber({ min: 10, max: 20 }) })[0],
          } as IProposal;
        }),
    [totalItems]
  );

  return seededData;
}
