'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { SparklingIcon } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { Pagination } from '@webb-tools/webb-ui-components/components/Pagination';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils/shortenHex';
import Image from 'next/image';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Blueprint } from '../../types';
import useBlueprintListing from './useBlueprintListing';

const columnHelper = createColumnHelper<Blueprint>();

const columns = [
  columnHelper.accessor('address', {
    header: () => 'Project',
    cell: (props) => <BlueprintItem {...props.row.original} />,
  }),
];

const BlueprintListing: FC = () => {
  const blueprints = useBlueprintListing();
  const [searchValue, setSearchValue] = useState('');

  const sortedBlueprints = useMemo(() => {
    return blueprints.sort((a, b) => {
      if (a.isBoosted && !b.isBoosted) {
        return -1;
      }

      if (!a.isBoosted && b.isBoosted) {
        return 1;
      }

      return 0;
    });
  }, [blueprints]);

  const table = useReactTable({
    data: sortedBlueprints,
    columns,
    initialState: {
      pagination: {
        pageSize: 12,
      },
    },
    getCoreRowModel: getCoreRowModel(),
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
      <div className="border-b-2 border-mono-80 dark:border-mono-170"></div>

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
