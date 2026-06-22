import { ChevronLeft, ChevronRight } from '@tangle-network/icons';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { getPaginationItems } from '../../utils';

import { PaginationProps } from './types';

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      boundaryCount,
      canNextPage,
      canPreviousPage,
      className,
      itemsPerPage,
      nextPage,
      page: currentPage,
      previousPage,
      setPageIndex,
      siblingCount,
      totalItems,
      totalPages,
      title,
      iconSize = 'lg',
      labelOverride,
      ...props
    },
    ref,
  ) => {
    const paginationDisplayItems = useMemo(
      () =>
        getPaginationItems({
          page: currentPage,
          count: totalPages,
          boundaryCount,
          siblingCount,
        }),
      [boundaryCount, currentPage, siblingCount, totalPages],
    );

    const showingItemsCount = useMemo(() => {
      const isLastPage = currentPage === totalPages;

      // If not the last page, return the itemsPerPage
      if (!isLastPage) {
        return itemsPerPage?.toLocaleString() ?? '—';
      }

      // Otherwise, calculate the remaining items on the last page
      const remainingItems = totalItems ? totalItems % (itemsPerPage ?? 1) : 0;

      return remainingItems > 0
        ? remainingItems.toLocaleString()
        : (itemsPerPage?.toLocaleString() ?? '—');
    }, [currentPage, itemsPerPage, totalItems, totalPages]);

    const titleSection = title !== undefined ? `${title} ` : '';

    return (
      <div
        {...props}
        className={twMerge(
          'flex items-center justify-between p-2 pl-4',
          'border-mono-40 dark:border-mono-140 border-t',
          className,
        )}
        ref={ref}
      >
        {/** Left label */}
        {labelOverride === undefined ? (
          <p className="body1 text-mono-120 dark:text-mono-100">
            {totalItems === 0
              ? 'No items'
              : `Showing ${showingItemsCount} ${titleSection}out of ${totalItems ?? '—'}`}
          </p>
        ) : (
          <p className="body1 text-mono-100">{labelOverride}</p>
        )}

        {/** Right buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={!canPreviousPage}
            onClick={() => {
              if (canPreviousPage && previousPage) {
                previousPage();
              }
            }}
            className={cx(
              'inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
              'border-mono-40 dark:border-mono-140 text-mono-120 dark:text-mono-100',
              'hover:bg-mono-20 hover:dark:bg-mono-160',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
            )}
          >
            <ChevronLeft size={iconSize} />
          </button>

          {paginationDisplayItems.map((page, idx) =>
            typeof page === 'number' ? (
              <button
                key={`${page}-${idx}`}
                type="button"
                onClick={() => setPageIndex?.(page - 1)}
                className={cx(
                  'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors',
                  currentPage === page
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-mono-120 dark:text-mono-100 hover:bg-mono-20 hover:dark:bg-mono-160',
                )}
              >
                {page}
              </button>
            ) : (
              <span
                key={`${page}-${idx}`}
                className="select-none px-1 text-mono-100"
              >
                …
              </span>
            ),
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={!canNextPage}
            onClick={() => {
              if (canNextPage && nextPage) {
                nextPage();
              }
            }}
            className={cx(
              'inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
              'border-mono-40 dark:border-mono-140 text-mono-120 dark:text-mono-100',
              'hover:bg-mono-20 hover:dark:bg-mono-160',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
            )}
          >
            <ChevronRight size={iconSize} />
          </button>
        </div>
      </div>
    );
  },
);
