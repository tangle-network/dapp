'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { SparklingIcon } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { Pagination } from '@webb-tools/webb-ui-components/components/Pagination';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils/shortenHex';
import Image from 'next/image';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Blueprint, BlueprintCategory } from '../../types';
import useBlueprintListing from './useBlueprintListing';

const columnHelper = createColumnHelper<Blueprint>();

const columns = [
  columnHelper.accessor('address', {
    header: () => 'Project',
    cell: (props) => <BlueprintItem {...props.row.original} />,
    filterFn: (row, _, filterValue) => {
      const { name, address, description } = row.original;
      return (
        name.toLowerCase().includes(filterValue.toLowerCase()) ||
        address.toLowerCase().includes(filterValue.toLowerCase()) ||
        description.toLowerCase().includes(filterValue.toLowerCase())
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
];

const BlueprintListing: FC = () => {
  const blueprints = useBlueprintListing();
  const [searchValue, setSearchValue] = useState('');
  const [filteredCategory, setFilteredCategory] =
    useState<BlueprintCategory | null>(null);

  const categoryItems = useMemo(
    () => [
      {
        label: 'View All',
        onClick: () => setFilteredCategory(null),
        isActive: filteredCategory === null,
      },
      ...Object.values(BlueprintCategory).map((category) => ({
        label: category,
        onClick: () => setFilteredCategory(category),
        isActive: filteredCategory === category,
      })),
    ],
    [filteredCategory],
  );

  const table = useReactTable({
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
      sorting: [
        {
          id: 'address',
          desc: false,
        },
      ],
    },
    state: {
      columnFilters: [
        {
          id: 'address',
          value: searchValue,
        },
        ...(filteredCategory
          ? [
              {
                id: 'category',
                value: filteredCategory,
              },
            ]
          : []),
      ],
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

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
          onChange={(val) => setSearchValue(val)}
          isControlled
          className="flex-1 rounded-full overflow-hidden"
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
                fw="normal"
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

      {/* Blueprint list */}
      <div className="grid grid-cols-3 gap-5">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id}>
            {row
              .getVisibleCells()
              .map((cell) =>
                flexRender(cell.column.columnDef.cell, cell.getContext()),
              )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        itemsPerPage={table.getState().pagination.pageSize}
        totalItems={Math.max(
          table.getPrePaginationRowModel().rows.length,
          blueprints.length,
        )}
        page={table.getState().pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        canPreviousPage={table.getCanPreviousPage()}
        previousPage={table.previousPage}
        canNextPage={table.getCanNextPage()}
        nextPage={table.nextPage}
        setPageIndex={table.setPageIndex}
        title="Blueprints"
      />
    </div>
  );
};

export default BlueprintListing;

const BlueprintItem: FC<Blueprint> = ({
  name,
  address,
  imgUrl,
  description,
  restakersCount,
  operatorsCount,
  tvl,
  isBoosted,
}) => {
  return (
    <div className="overflow-hidden rounded-xl flex flex-col -space-y-2">
      {isBoosted && <div className="h-2 bg-purple-60 dark:bg-purple-50" />}
      <div
        className={twMerge(
          'bg-[linear-gradient(180deg,rgba(236,239,255,0.20)_0%,rgba(184,196,255,0.20)_100%),linear-gradient(180deg,rgba(255,255,255,0.50)_0%,rgba(255,255,255,0.30)_100%)]',
          'dark:bg-[linear-gradient(180deg,rgba(17,22,50,0.20)_0%,rgba(21,37,117,0.20)_100%),linear-gradient(180deg,rgba(43,47,64,0.50)_0%,rgba(43,47,64,0.30)_100%)]',
          'h-[364px] flex flex-col justify-between py-3 px-6 rounded-xl overflow-hidden',
        )}
      >
        <div className="space-y-3">
          <div className="py-2 flex items-center gap-2 border-b border-mono-60 dark:border-mono-170">
            <Image
              src={imgUrl}
              width={72}
              height={72}
              alt={name}
              className="rounded-full bg-center"
              fill={false}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Typography variant="h5" className="flex-1">
                  {name}
                </Typography>
                {isBoosted && (
                  <div className="px-2 py-1 rounded-full border border-purple-50 flex items-center gap-0.5">
                    <SparklingIcon className="fill-purple-60 dark:fill-purple-40" />
                    <Typography
                      variant="body4"
                      className="text-purple-60 dark:text-purple-40"
                    >
                      Boosted
                    </Typography>
                  </div>
                )}
              </div>
              <Typography
                variant="body2"
                className="text-mono-120 dark:text-mono-100"
              >
                {shortenHex(address)}
              </Typography>
            </div>
          </div>

          <Typography
            variant="body2"
            className="text-mono-120 dark:text-mono-100"
          >
            {formatDescription(description)}
          </Typography>
        </div>

        <div className="w-full flex gap-1">
          <div className="flex-1 space-y-2">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              Restakers
            </Typography>
            <Typography variant="h5">{restakersCount}</Typography>
          </div>
          <div className="flex-1 space-y-2">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              Operators
            </Typography>
            <Typography variant="h5">{operatorsCount}</Typography>
          </div>
          <div className="flex-1 space-y-2">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              TVL
            </Typography>
            <Typography variant="h5">{tvl}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatDescription(description: string): string {
  const maxLength = 200;
  const ellipsis = '...';

  if (description.length > maxLength + ellipsis.length) {
    return description.slice(0, maxLength) + ellipsis;
  }

  return description;
}
