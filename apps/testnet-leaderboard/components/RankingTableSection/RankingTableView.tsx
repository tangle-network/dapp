'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from '@webb-tools/icons';
import {
  fuzzyFilter,
  Input,
  Pagination,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { type FC, useMemo, useState } from 'react';

import { BadgeEnum } from '../../types';
import BadgesCell from './BadgesCell';
import HeaderCell from './HeaderCell';
import IdentityCell from './IdentityCell';
import SessionsCell from './SessionsCell';
import SocialLinksCell from './SocialLinksCell';
import type {
  IdentityType,
  LeaderboardSuccessResponseType,
  ParticipantType,
  SessionsType,
} from './types';

export type RankingItemType = {
  address: string;
  badges: BadgeEnum[];
  points: number;
  sessions: SessionsType;
  identity: IdentityType;
};

const columnHelper = createColumnHelper<RankingItemType>();

const columns = [
  columnHelper.accessor('points', {
    header: () => <HeaderCell title="Rank" />,
    cell: (cellCtx) => {
      // const globalRowIndex = points.row.index + pageIndex * pageSize;
      return (
        <Typography variant="mkt-small-caps" fw="bold">
          #{cellCtx.row.index + 1}
        </Typography>
      );
    },
  }),

  columnHelper.accessor('address', {
    header: () => <HeaderCell title="Identity" />,
    cell: (cellCtx) => (
      <IdentityCell
        address={cellCtx.getValue()}
        identity={cellCtx.row.original.identity}
      />
    ),
  }),

  columnHelper.accessor('badges', {
    header: () => <HeaderCell title="Badges" />,
    cell: (badges) => <BadgesCell badges={badges.getValue()} />,
  }),

  columnHelper.accessor('sessions', {
    header: () => <HeaderCell title="Number of sessions" />,
    cell: (cellCtx) => <SessionsCell sessions={cellCtx.getValue()} />,
  }),

  columnHelper.accessor('points', {
    header: () => <HeaderCell title="Points" />,
    cell: (points) => (
      <Typography variant="mkt-small-caps" fw="bold" ta="center">
        {points.renderValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('identity', {
    header: () => <HeaderCell title="Social" />,
    cell: (cellCtx) => <SocialLinksCell identity={cellCtx.getValue()} />,
  }),
];

type Props = {
  participants: LeaderboardSuccessResponseType['data']['participants'];
};

const participantToRankingItem = (participant: ParticipantType) =>
  ({
    address: participant.addresses[0].address,
    badges: participant.badges,
    points: participant.points,
    sessions: participant.sessions,
    identity: participant.identity,
  } satisfies RankingItemType);

const PAGE_SIZE = 20;

const RankingTableView: FC<Props> = ({ participants }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const rankingData = useMemo(
    () => participants.map(participantToRankingItem),
    [participants]
  );

  const total = useMemo(() => rankingData.length, [rankingData]);

  const table = useReactTable({
    data: rankingData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
    globalFilterFn: fuzzyFilter,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    debugTable: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="mkt-body2" fw="black">
          Latest ranking:
        </Typography>
        <div className="flex items-center gap-2 w-max md:w-1/2">
          <Typography variant="mkt-body2" fw="black">
            Search:
          </Typography>
          <Input
            id="addressSearch"
            placeholder="Enter to search address"
            className="flex-[1]"
            rightIcon={<Search className="fill-mono-140" />}
            value={searchTerm}
            onChange={setSearchTerm}
            debounceTime={500}
          />
        </div>
      </div>
      <div className="overflow-scroll border rounded-lg border-mono-60">
        <table className="w-full">
          <thead className="border-b border-mono-60">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <th key={idx} className={cx('px-2 py-2 md:px-4 md:py-2')}>
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell, idx) => (
                    <td key={idx} className="px-2 py-2 md:px-4 md:py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                {/** This is a hack to make the table data full width */}
                <td colSpan={Number.MAX_SAFE_INTEGER} className="p-2">
                  <Typography variant="mkt-body2" fw="semibold" ta="center">
                    No participants found.
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        canNextPage={table.getCanNextPage()}
        canPreviousPage={table.getCanPreviousPage()}
        itemsPerPage={table.getState().pagination.pageSize}
        totalItems={total}
        totalPages={table.getPageCount()}
        previousPage={table.previousPage}
        nextPage={table.nextPage}
        page={table.getState().pagination.pageIndex + 1}
        setPageIndex={table.setPageIndex}
        title="participants"
        className="gap-3 p-0 border-0"
        iconSize="md"
      />
    </div>
  );
};

export default RankingTableView;
