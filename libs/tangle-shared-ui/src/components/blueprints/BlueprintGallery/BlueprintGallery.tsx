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
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { Pagination } from '@webb-tools/webb-ui-components/components/Pagination';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { ComponentProps, FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import BlueprintItem from './BlueprintItem';
import { BlueprintGalleryProps, BlueprintItemProps } from './types';

const columnHelper = createColumnHelper<BlueprintItemProps>();

const BlueprintGallery: FC<BlueprintGalleryProps> = ({
  blueprints,
  isLoading,
  error,
  BlueprintItemWrapper,
  rowSelection,
  onRowSelectionChange,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const [filteredCategory, setFilteredCategory] = useState<
    'View All' | (string & {})
  >('View All');

  const isEmpty = blueprints.length === 0;

  const categories = useMemo(
    () =>
      Array.from(
        blueprints.reduce((acc, { category }) => {
          if (category) {
            acc.add(category);
          }
          return acc;
        }, new Set<string>()),
      ),
    [blueprints],
  );

  const categoryItems = useMemo(
    () => [
      {
        label: 'View All',
        onClick: () => setFilteredCategory('View All'),
        isActive: filteredCategory === 'View All',
      },
      ...categories.map((category) => ({
        label: category,
        onClick: () => setFilteredCategory(category),
        isActive: filteredCategory === category,
      })),
    ],
    [categories, filteredCategory],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
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
        filterFn: (row, _, filterValue) => {
          const { name, author, description } = row.original;
          return (
            name.toLowerCase().includes(filterValue.toLowerCase()) ||
            author.toLowerCase().includes(filterValue.toLowerCase()) ||
            (description?.toLowerCase() ?? '').includes(
              filterValue.toLowerCase(),
            )
          );
        },
        sortingFn: (rowA, rowB) => {
          const isBlueprintABoosted = rowA.original.isBoosted;
          const isBlueprintBBoosted = rowB.original.isBoosted;
          if (isBlueprintABoosted && !isBlueprintBBoosted) {
            return -1;
          }
          if (!isBlueprintABoosted && isBlueprintBBoosted) {
            return 1;
          }
          return 0;
        },
      }),
      columnHelper.accessor('category', {
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
        getRowId: (row) => row.id,
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
      {/* Search bar */}
      <div
        className={twMerge(
          'rounded-xl py-4 px-6 bg-mono-0 dark:bg-mono-180',
          'flex items-center gap-2',
        )}
      >
        <Input
          id="search-blueprints"
          placeholder="Search"
          value={searchValue}
          onChange={setSearchValue}
          isControlled
          className="flex-1 overflow-hidden rounded-full"
          inputClassName="border-0 bg-mono-20 dark:bg-mono-200"
        />
        <Button variant="secondary">Search</Button>
      </div>

      {/* Category */}
      <div className="-space-y-0.5">
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
      </div>

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
          className="flex items-center justify-center h-40"
        >
          {error.message}
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

          {/* Pagination */}
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
            title="Blueprints"
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
