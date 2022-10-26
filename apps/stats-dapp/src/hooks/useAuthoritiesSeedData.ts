import { randBic, randBrand, randCountryCode, randNumber } from '@ngneat/falso';
import { arrayFrom } from '@nepoche/webb-ui-components/utils';

import { AuthorityRowType } from '../containers/KeyDetail/types';

/**
 * Get a new seeded keygen
 * @returns {KeygenType}
 */
const getNewAuthority = (): AuthorityRowType => {
  return {
    id: randBrand() + randBic(),
    account: randBrand() + randBic(),
    location: randCountryCode(),
    uptime: randNumber({ min: 90, max: 100 }),
    reputation: randNumber({ min: 90, max: 100 }),
    detaillUrl: 'https://webb.tools',
  };
};

/**
 * Get the keygen seeded data, use in keygen table
 * @param sizeArg Represents the size of the data array (default will be a random number in range 50..100 inclusive)
 */
export const useAuthoritiesSeedData = (sizeArg?: number): AuthorityRowType[] => {
  const size = sizeArg ?? randNumber({ min: 50, max: 100 });

  return arrayFrom(size, () => getNewAuthority());
};

// Seeded data for pagination
const DATA = arrayFrom(randNumber({ min: 10, max: 20 }), () => getNewAuthority());

/**
 * Fake fetch function to get keygen seeded data
 * @param options Object contains `pageIndex` and `pageSize` to pagination
 * @returns Paginated keygen data
 */
export const fetchAuthoritiesData = async (options: { pageIndex: number; pageSize: number }) => {
  // Simualte some network latency
  await new Promise((r) => setTimeout(r, 500));

  return {
    rows: DATA.slice(options.pageIndex * options.pageSize, (options.pageIndex + 1) * options.pageSize),
    pageCount: Math.ceil(DATA.length / options.pageSize),
    totalItems: DATA.length,
  };
};
