import { randNumber } from '@ngneat/falso';
import { useCallback, useMemo } from 'react';

import { arrayFrom } from '../utils';

/**
 * A hook to create seed data for UI
 * @param factoryFn The factory function to create a seeded data
 * @param sizeArg The optional size indicates the total number of items in the seeded array
 * @returns an array of seeded items and a 'fake' fetch function to get data
 */
export const useSeedData = <T,>(factoryFn: () => T, sizeArg?: number) => {
  const size = useMemo(() => sizeArg ?? randNumber({ min: 50, max: 100 }), [sizeArg]);

  const seedItems = useMemo(() => arrayFrom(size, () => factoryFn()), [factoryFn, size]);

  /**
   * Fake fetch function to get seeded data
   * @param options Object contains `pageIndex` and `pageSize` to pagination
   * @returns Paginated data
   */
  const fetchData = useCallback(
    async (options: {
      pageIndex: number;
      pageSize: number;
    }): Promise<{ rows: T[]; pageCount: number; totalItems: number }> => {
      // Simualte some network latency
      await new Promise((r) => setTimeout(r, 500));

      return {
        rows: seedItems.slice(options.pageIndex * options.pageSize, (options.pageIndex + 1) * options.pageSize),
        pageCount: Math.ceil(seedItems.length / options.pageSize),
        totalItems: seedItems.length,
      };
    },
    [seedItems]
  );

  return {
    seedItems,
    fetchData,
  };
};
