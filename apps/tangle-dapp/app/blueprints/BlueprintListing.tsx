'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { Pagination } from '@webb-tools/webb-ui-components/components/Pagination';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { PagePath } from '../../types';
import { Blueprint, BlueprintCategory } from '../../types/blueprint';
import BoostedChip from './BoostedChip';
import useBlueprintListing from './useBlueprintListing';

const columnHelper = createColumnHelper<Blueprint>();

const columns = [
  columnHelper.accessor('author', {
    header: () => 'Project',
    cell: (props) => <BlueprintItem {...props.row.original} />,
    filterFn: (row, _, filterValue) => {
      const { name, author, description } = row.original;
      return (
        name.toLowerCase().includes(filterValue.toLowerCase()) ||
        author.toLowerCase().includes(filterValue.toLowerCase()) ||
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
  author,
  imgUrl,
  description,
  restakersCount,
  operatorsCount,
  tvl,
  isBoosted,
}) => {
  return (
    <Link href={`${PagePath.BLUEPRINTS}/${name}`}>
      <div
        className={twMerge(
          'h-[364px] overflow-hidden rounded-xl flex flex-col cursor-pointer group',
          'border border-mono-0 dark:border-mono-170',
          isBoosted && 'border-t-0',
        )}
      >
        {isBoosted && (
          <div
            className={twMerge(
              'h-2 bg-purple-60',
              'bg-[linear-gradient(to_right,hsla(230,64%,52%,0.8)0%,hsla(230,87%,74%,0.8)40%,hsla(242,100%,93%,0.8)100%)]',
              'dark:bg-[linear-gradient(to_right,hsla(231,49%,13%,0.8)0%,hsla(242,67%,55%,0.8)40%,hsla(242,93%,65%,0.8)100%)]',
            )}
          />
        )}
        <div
          className={twMerge(
            'relative flex-1 flex flex-col justify-between py-3 px-6 overflow-hidden',
            'bg-[linear-gradient(180deg,rgba(184,196,255,0.20)0%,rgba(236,239,255,0.20)100%),linear-gradient(180deg,rgba(255,255,255,0.50)0%,rgba(255,255,255,0.30)100%)]',
            'dark:bg-[linear-gradient(180deg,rgba(17,22,50,0.20)0%,rgba(21,37,117,0.20)100%),linear-gradient(180deg,rgba(43,47,64,0.50)0%,rgba(43,47,64,0.30)100%)]',
            'hover:before:absolute hover:before:inset-0 hover:before:bg-cover hover:before:bg-no-repeat hover:before:opacity-50 hover:before:pointer-events-none',
            "hover:before:bg-[url('/static/assets/blueprints/grid-bg.png')] dark:hover:before:bg-[url('/static/assets/blueprints/grid-bg-dark.png')]",
          )}
        >
          <div className="space-y-3">
            <div className="py-2 flex items-center gap-2 border-b border-mono-60 dark:border-mono-170">
              <Image
                src={imgUrl}
                width={72}
                height={72}
                alt={name}
                className="rounded-full bg-center flex-shrink-0"
                fill={false}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <Typography
                      variant="h5"
                      className="truncate text-mono-180 dark:text-mono-20 group-hover:text-mono-200 dark:group-hover:text-mono-0"
                    >
                      {name}
                    </Typography>
                  </div>
                  {isBoosted && <BoostedChip />}
                </div>
                <Typography
                  variant="body2"
                  className="line-clamp-1 text-mono-120 dark:text-mono-100"
                >
                  {isEthereumAddress(author) ? shortenHex(author) : author}
                </Typography>
              </div>
            </div>

            <Typography
              variant="body2"
              className="line-clamp-[7] text-mono-120 dark:text-mono-100 group-hover:text-mono-200 dark:group-hover:text-mono-0"
            >
              {description}
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
    </Link>
  );
};
