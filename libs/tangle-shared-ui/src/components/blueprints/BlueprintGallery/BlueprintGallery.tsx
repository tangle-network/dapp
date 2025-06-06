'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { fuzzyFilter } from '@tangle-network/ui-components/components/Filter/utils';
import { Pagination } from '@tangle-network/ui-components/components/Pagination';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { ComponentProps, FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TangleError } from '../../../types/error';
import BlueprintItem from './BlueprintItem';
import { BlueprintGalleryProps, BlueprintItemProps } from './types';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import filterBy from '../../../utils/filterBy';

const COLUMN_HELPER = createColumnHelper<BlueprintItemProps>();

const BlueprintGallery: FC<BlueprintGalleryProps> = ({
  blueprints,
  isLoading,
  error,
  BlueprintItemWrapper,
  rowSelection,
  onRowSelectionChange,
}) => {
  const [filteredCategory] = useState<'View All' | (string & {})>('View All');

  const isEmpty = blueprints.length === 0;

  // const categories = useMemo(
  //   () =>
  //     Array.from(
  //       blueprints.reduce((acc, { category }) => {
  //         if (category) {
  //           acc.add(category);
  //         }
  //         return acc;
  //       }, new Set<string>()),
  //     ),
  //   [blueprints],
  // );

  // const categoryItems = useMemo(
  //   () => [
  //     {
  //       label: 'View All',
  //       onClick: () => setFilteredCategory('View All'),
  //       isActive: filteredCategory === 'View All',
  //     },
  //     ...categories.map((category) => ({
  //       label: category,
  //       onClick: () => setFilteredCategory(category),
  //       isActive: filteredCategory === category,
  //     })),
  //   ],
  //   [categories, filteredCategory],
  // );

  const columns = useMemo(
    () => [
      COLUMN_HELPER.accessor('name', {
        header: () => 'Project',
        cell: (props) => {
          const selectionProps =
            typeof rowSelection !== 'undefined' &&
            typeof onRowSelectionChange === 'function'
              ? {
                  isSelected: props.row.getIsSelected(),
                  onSelectedChange: props.row.getToggleSelectedHandler(),
                }
              : {};

          return typeof BlueprintItemWrapper === 'undefined' ? (
            <BlueprintItem {...props.row.original} {...selectionProps} />
          ) : (
            <BlueprintItemWrapper {...props.row.original}>
              <BlueprintItem {...props.row.original} {...selectionProps} />
            </BlueprintItemWrapper>
          );
        },
        filterFn: (row, query) =>
          filterBy(query, [
            row.original.name,
            row.original.author,
            row.original.description,
          ]),
        sortingFn: (rowA, rowB) => {
          const isBlueprintABoosted = rowA.original.isBoosted;
          const isBlueprintBBoosted = rowB.original.isBoosted;

          if (isBlueprintABoosted && !isBlueprintBBoosted) {
            return -1;
          } else if (!isBlueprintABoosted && isBlueprintBBoosted) {
            return 1;
          } else {
            return 0;
          }
        },
      }),
      COLUMN_HELPER.accessor('category', {
        header: () => null,
        cell: () => null,
        filterFn: (row, _, filterValue) => {
          return row.original.category === filterValue;
        },
      }),
    ],
    [BlueprintItemWrapper, onRowSelectionChange, rowSelection],
  );

  const table = useReactTable(
    useMemo<TableOptions<BlueprintItemProps>>(
      () => ({
        data: blueprints,
        columns,
        filterFns: {
          fuzzy: fuzzyFilter,
        },
        globalFilterFn: fuzzyFilter,
        initialState: {
          columnVisibility: {
            category: false,
          },
          pagination: {
            pageSize: 12,
          },
        },
        state: {
          rowSelection,
          columnFilters: [
            ...(filteredCategory !== 'View All'
              ? [
                  {
                    id: 'category',
                    value: filteredCategory,
                  },
                ]
              : []),
          ],
        },
        onRowSelectionChange,
        getRowId: (row) => row.id.toString(),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
      }),
      [
        blueprints,
        columns,
        filteredCategory,
        onRowSelectionChange,
        rowSelection,
      ],
    ),
  );

  return (
    <div className="space-y-5">
      {/* Category */}
      {/* <div className="-space-y-0.5">
        <div className="flex items-center gap-9">
          {categoryItems.map(({ label, onClick, isActive }, idx) => (
            <div
              key={idx}
              className={twMerge(
                'group cursor-pointer py-3 border-b-2 border-mono-80 dark:border-mono-170',
                isActive && 'border-purple-50 dark:border-purple-60',
              )}
              onClick={onClick}
            >
              <Typography
                variant="h5"
                className={twMerge(
                  'text-mono-140 dark:text-mono-100',
                  !isActive &&
                    'group-hover:text-mono-160 dark:group-hover:text-mono-80',
                  isActive && 'text-mono-200 dark:text-mono-0',
                )}
              >
                {label}
              </Typography>
            </div>
          ))}
        </div>

        <div className="h-0.5 bg-mono-80 dark:bg-mono-170" />
      </div> */}

      {isLoading ? (
        <GalleryContainer>
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonLoader key={idx} className="h-80" />
          ))}
        </GalleryContainer>
      ) : error ? (
        <Typography
          ta="center"
          variant="body1"
          className="flex items-center justify-center h-40 md:max-w-[75%] md:mx-auto"
        >
          {error instanceof TangleError ? error.description : error.message}
        </Typography>
      ) : isEmpty ? (
        <Typography
          ta="center"
          variant="body1"
          className="flex items-center justify-center h-36"
        >
          No blueprints found. Check back later or try a different network.
        </Typography>
      ) : (
        <>
          {/* Blueprint list */}
          <GalleryContainer>
            {table.getRowModel().rows.map((row) => (
              <div key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </GalleryContainer>

          <Pagination
            itemsPerPage={table.getState().pagination.pageSize}
            totalItems={table.getRowCount()}
            page={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            canPreviousPage={table.getCanPreviousPage()}
            previousPage={table.previousPage}
            canNextPage={table.getCanNextPage()}
            nextPage={table.nextPage}
            setPageIndex={table.setPageIndex}
            title={pluralize('blueprint', blueprints.length !== 1)}
          />
        </>
      )}
    </div>
  );
};

export default BlueprintGallery;

const GalleryContainer = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    {...props}
    className={twMerge(
      'grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3',
      className,
    )}
  />
);
