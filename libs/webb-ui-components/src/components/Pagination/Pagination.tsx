import { ChevronLeft, ChevronRight } from '../../icons';
import { getPaginationItems } from '../../utils';
import cx from 'classnames';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { PaginationProps } from './types';

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
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
      ...props
    },
    ref
  ) => {
    const paginationDisplayItems = useMemo(
      () => getPaginationItems({ page: currentPage, count: totalPages, boundaryCount, siblingCount }),
      [boundaryCount, currentPage, siblingCount, totalPages]
    );

    const showingItemsCount = useMemo(
      () => (itemsPerPage && totalItems ? Math.min(itemsPerPage, totalItems) : '-'),
      [itemsPerPage, totalItems]
    );

    const mergedClsx = useMemo(
      () =>
        twMerge(
          'flex items-center justify-between px-3 py-4',
          'border-mono-40 dark:border-mono-140 border-t',
          className
        ),
      [className]
    );

    return (
      <div {...props} className={mergedClsx} ref={ref}>
        {/** Left label */}
        <p className='body1 text-mono-160 dark:text-mono-100'>
          Showing {showingItemsCount} Keys out of {totalItems ?? '-'}
        </p>

        {/** Right buttons */}
        <div className='flex items-center space-x-2'>
          <ChevronLeft
            className={cx('cursor-pointer')}
            onClick={() => {
              if (canPreviousPage && previousPage) {
                previousPage();
              }
            }}
            size='lg'
          />

          {paginationDisplayItems.map((page, idx) =>
            typeof page === 'number' ? (
              <button
                key={`${page}-${idx}`}
                className={cx(
                  'p-2 text-center body1 rounded-md',
                  currentPage === page
                    ? 'bg-blue-0 text-blue dark:bg-blue-120 dark:text-blue-0' // Active
                    : 'bg-mono-0 dark:bg-mono-180 text-mono-200 dark:text-mono-40 hover:bg-mono-20 hover:dark:bg-mono-160'
                )}
                onClick={() => setPageIndex?.(page - 1)}
              >
                {page}
              </button>
            ) : (
              <p key={`${page}-${idx}`} className='p-2 text-center select-none body1'>
                ...
              </p>
            )
          )}

          <ChevronRight
            className={cx('cursor-pointer')}
            onClick={() => {
              if (canNextPage && nextPage) {
                nextPage();
              }
            }}
            size='lg'
          />
        </div>
      </div>
    );
  }
);
