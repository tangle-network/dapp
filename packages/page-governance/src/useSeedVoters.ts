import { randEthereumAddress, randFloat, randNumber } from '@ngneat/falso';
import { shuffle } from 'lodash';
import { useCallback, useMemo } from 'react';

import { IProposalVoter } from './ProposalDetail';
import { useSeedProposals } from './useSeedProposals';

export function useSeedVoters() {
  const votersRegistry = useMemo(() => ({} as { [voteId: string]: IProposalVoter[] }), []);
  const seededProposals = useSeedProposals();

  const getVoters = useCallback(
    (voteId: string) => {
      const savedVoters = votersRegistry[voteId];
      if (savedVoters) {
        return savedVoters;
      }

      const matchedProposal = seededProposals.find((proposal) => proposal.voteId.toString() === voteId);
      if (!matchedProposal) {
        return null;
      }

      const totalVotes = matchedProposal.totalVotes;
      const yesVotesAmount = Math.floor(totalVotes * randFloat({ min: 0.3, max: 0.7, fraction: 2 }));
      const noVotesAmount = totalVotes - yesVotesAmount;

      const yesVoters = Array(yesVotesAmount)
        .fill(null)
        .map(
          () =>
            ({
              address: randEthereumAddress(),
              paymentAmount: randFloat({ min: 0.01, max: 2, fraction: 2 }),
              paymentTokenSymbol: 'ETH',
              vote: true,
            } as IProposalVoter)
        );

      const noVoters = Array(noVotesAmount)
        .fill(null)
        .map(
          () =>
            ({
              address: randEthereumAddress(),
              paymentAmount: randNumber({ min: 0.01, max: 2, fraction: 2 }),
              paymentTokenSymbol: 'ETH',
              vote: false,
            } as IProposalVoter)
        );

      const newVoters = shuffle([...yesVoters, ...noVoters]);
      votersRegistry[voteId] = newVoters;
      return newVoters;
    },
    [seededProposals, votersRegistry]
  );

  return {
    votersRegistry,
    getVoters,
  };
}
