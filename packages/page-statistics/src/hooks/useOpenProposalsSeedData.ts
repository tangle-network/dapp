import { randBic, randBrand, randEthereumAddress, randNumber, randRecentDate } from '@ngneat/falso';
import { arrayFrom } from '@webb-dapp/webb-ui-components/utils';

import { ProposalType } from '../generated/graphql';
import { ProposalListItem, ProposalStatus } from '../provider/hooks';

/**
 * Get a new seeded proposal
 * @returns {ProposalListItem}
 */
const getNewProposal = (): ProposalListItem => {
  const rand = randNumber({ min: 5, max: 20 });
  return {
    id: randBrand() + randBic(),
    status: Object.keys(ProposalStatus)[Math.floor(Math.random() * 7)] as ProposalStatus,
    type: Object.keys(ProposalType)[Math.floor(Math.random() * 16)] as ProposalType,
    txHash: randEthereumAddress(),
    proposers: {
      firstElements: arrayFrom(rand, () => randEthereumAddress()),
      count: rand,
    },
    height: randRecentDate().getTime().toString(),
    chain: 'eth',
  };
};

/**
 * Get the proposals seeded data
 * @param sizeArg Represents the size of the data array (default will be a random number in range 50..100 inclusive)
 */
export const useOpenProposalsSeedData = (sizeArg?: number): ProposalListItem[] => {
  const size = sizeArg ?? randNumber({ min: 50, max: 100 });

  return arrayFrom(size, () => getNewProposal());
};
