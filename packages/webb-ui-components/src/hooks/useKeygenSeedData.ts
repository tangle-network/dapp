import { randEthereumAddress, randNumber } from '@ngneat/falso';

import { KeygenType } from '../types';
import { arrayFrom } from '../utils';

/**
 * Get a new seeded keygen
 * @returns {KeygenType}
 */
const getNewKeygen = (): KeygenType => {
  return {
    height: randNumber({ min: 100, max: 150 }),
    session: randNumber({ min: 50, max: 100 }),
    key: randEthereumAddress(),
    keygenThreshold: randNumber({ min: 1, max: 50 }),
    signatureThreshold: randNumber({ min: 1, max: 50 }),
    authorities: new Set(
      arrayFrom(randNumber({ min: 10, max: 20 }), () => '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
    ),
    totalAuthorities: randNumber({ min: 50, max: 100 }),
    keyId: 'https://webb.tools',
  };
};

/**
 * Get the keygen seeded data, use in keygen table
 * @param sizeArg Represents the size of the data array (default will be a random number in range 50..100 inclusive)
 */
export const useKeygenSeedData = (sizeArg?: number): KeygenType[] => {
  const size = sizeArg ?? randNumber({ min: 50, max: 100 });

  return arrayFrom(size, () => getNewKeygen());
};

// Seeded data for pagination
const DATA = arrayFrom(randNumber({ min: 100, max: 150 }), () => getNewKeygen());

/**
 * Fake fetch function to get keygen seeded data
 * @param options Object contains `pageIndex` and `pageSize` to pagination
 * @returns Paginated keygen data
 */
export const fetchKeygenData = async (options: { pageIndex: number; pageSize: number }) => {
  // Simualte some network latency
  await new Promise((r) => setTimeout(r, 500));

  return {
    rows: DATA.slice(options.pageIndex * options.pageSize, (options.pageIndex + 1) * options.pageSize),
    pageCount: Math.ceil(DATA.length / options.pageSize),
    totalItems: DATA.length,
  };
};
