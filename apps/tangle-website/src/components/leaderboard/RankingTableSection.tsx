import { useState } from 'react';
import cx from 'classnames';
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Input, Typography, Pagination } from '@webb-tools/webb-ui-components';
import { Search } from '@webb-tools/icons';

import {
  AddressCell,
  BadgesCell,
  HeaderCell,
  RankingItemType,
} from './tableComponents';

const pageSize = 20;

const columnHelper = createColumnHelper<RankingItemType>();

const columns = [
  columnHelper.accessor('points', {
    header: () => <HeaderCell title="Rank" />,
    cell: (points) => (
      <Typography variant="mkt-small-caps" fw="bold">
        #{points.row.index + 1}
      </Typography>
    ),
  }),
  columnHelper.accessor('address', {
    header: () => <HeaderCell title="Address" />,
    cell: (address) => <AddressCell address={address.getValue()} />,
  }),
  columnHelper.accessor('badges', {
    header: () => <HeaderCell title="Badges" />,
    cell: (badges) => <BadgesCell badges={badges.getValue()} />,
  }),
  columnHelper.accessor('points', {
    header: () => <HeaderCell title="Points" />,
    cell: (points) => (
      <Typography variant="mkt-small-caps" fw="bold" ta="center">
        {points.renderValue()}
      </Typography>
    ),
  }),
];

export const RankingTableSection = () => {
  const [rankingData, setRankingData] = useState<RankingItemType[]>([]);

  const {
    getHeaderGroups,
    getRowModel,
    getPageCount,
    getState,
    setPageIndex,
    previousPage,
    nextPage,
    getCanPreviousPage,
    getCanNextPage,
  } = useReactTable({
    data: rankingData,
    columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: () => {
        return true;
      },
    },
  });

  const pageIndex = getState().pagination.pageIndex;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Typography variant="mkt-body2" fw="black">
          Latest ranking:
        </Typography>
        <div className="w-max md:w-1/2 flex items-center gap-2">
          <Typography variant="mkt-body2" fw="black">
            Search:
          </Typography>
          <Input
            id="addressSearch"
            placeholder="Enter to search address"
            className="flex-[1]"
            rightIcon={<Search className="fill-mono-140" />}
          />
        </div>
      </div>
      <div className="rounded-lg border border-mono-60 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-mono-60">
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={idx}
                    className={cx('px-2 py-2 md:px-6 md:py-3', {
                      'w-[10%]': header.id === 'points',
                      'w-[40%]': !(header.id === 'points'),
                    })}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell, idx) => (
                  <td key={idx} className="px-2 py-2 md:px-6 md:py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        canNextPage={getCanNextPage()}
        canPreviousPage={getCanPreviousPage()}
        itemsPerPage={pageSize}
        totalItems={rankingData.length}
        totalPages={getPageCount()}
        previousPage={previousPage}
        nextPage={nextPage}
        page={pageIndex + 1}
        setPageIndex={setPageIndex}
        title="participants"
        className="p-0 gap-3 border-0"
        iconSize="md"
      />
    </div>
  );
};
