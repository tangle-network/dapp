import { randBic, randBrand, randEthereumAddress, randHexaDecimal, randNumber, randRecentDate } from '@ngneat/falso';
import { arrayFrom } from '@nepoche/webb-ui-components/utils';

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
      firstElements: arrayFrom(rand, () => randHexaDecimal({ length: 64 }).join('')),
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
export const useProposalsSeedData = (sizeArg?: number): ProposalListItem[] => {
  const size = sizeArg ?? randNumber({ min: 50, max: 100 });

  return arrayFrom(size, () => getNewProposal());
};

// Seeded data for pagination
const DATA = arrayFrom(randNumber({ min: 10, max: 20 }), () => getNewProposal());

/**
 * Fake fetch function to get seeded data
 * @param options Object contains `pageIndex` and `pageSize` to pagination
 * @returns Paginated data
 */
export const fetchProposalsData = async (options: { pageIndex: number; pageSize: number }) => {
  // Simualte some network latency
  await new Promise((r) => setTimeout(r, 500));

  return {
    rows: DATA.slice(options.pageIndex * options.pageSize, (options.pageIndex + 1) * options.pageSize),
    pageCount: Math.ceil(DATA.length / options.pageSize),
    totalItems: DATA.length,
  };
};
