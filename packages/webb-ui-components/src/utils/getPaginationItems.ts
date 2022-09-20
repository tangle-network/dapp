import { range } from './range';

export interface PaginationItemsOptions {
  /**
   * The total number of pages.
   * @default 1
   */
  count?: number;
  /**
   * Number of always visible pages at the beginning and end.
   * @default 1
   */
  boundaryCount?: number;
  /**
   * Number of always visible pages before and after the current page.
   * @default 1
   */
  siblingCount?: number;
  /**
   * The current page.
   * @default 1
   */
  page?: number;
}

/**
 * Get the array of displayed items of pagination. E.g. [1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10,]
 * @param options {PaginationItemsOptions} The hook options
 */
export const getPaginationItems = (options: PaginationItemsOptions): (number | string)[] => {
  const { boundaryCount = 1, count = 1, page = 1, siblingCount = 1 } = options;

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(
      // Natural start
      page - siblingCount,
      // Lower boundary when page is high
      count - boundaryCount - siblingCount * 2 - 1
    ),
    // Greater than startPages
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(
      // Natural end
      page + siblingCount,
      // Upper boundary when page is low
      boundaryCount + siblingCount * 2 + 2
    ),
    // Less than endPages
    endPages.length > 0 ? endPages[0] - 2 : count - 1
  );

  return [
    ...startPages,

    // Start ellipsis
    ...(siblingsStart > boundaryCount + 2
      ? ['start-ellipsis']
      : boundaryCount + 1 < count - boundaryCount
      ? [boundaryCount + 1]
      : []),

    // Sibling pages
    ...range(siblingsStart, siblingsEnd),

    // End ellipsis
    ...(siblingsEnd < count - boundaryCount - 1
      ? ['end-ellipsis']
      : count - boundaryCount > boundaryCount
      ? [count - boundaryCount]
      : []),

    ...endPages,
  ].filter((val) => (typeof val !== 'number' ? true : val > 0));
};
