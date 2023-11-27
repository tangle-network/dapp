'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, Spinner } from '@webb-tools/icons';
import { Input, Pagination, Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { type FC, useMemo, useState } from 'react';
import useSWR from 'swr';

import { BadgeEnum } from '../../types';
import AddressCell from './AddressCell';
import BadgesCell from './BadgesCell';
import fetchLeaderboardData from './fetchLeaderboardData';
import HeaderCell from './HeaderCell';
import ParseReponseErrorView from './ParseReponseErrorView';
import type { LeaderboardSuccessResponseType, ParticipantType } from './types';

export type RankingItemType = {
  address: string;
  badges: BadgeEnum[];
  points: number;
};

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

type Props = LeaderboardSuccessResponseType['data'];

const participantToRankingItem = (participant: ParticipantType) =>
  ({
    address: participant.addresses[0].address,
    badges: participant.badges,
    points: participant.points,
  } satisfies RankingItemType);

const RankingTableView: FC<Props> = ({
  participants,
  limit: defaultLimit,
  skip: defaultSkip,
  total: defaultTotal,
}) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: defaultSkip,
    pageSize: defaultLimit,
  });

  const { data, isLoading } = useSWR(
    [fetchLeaderboardData.name, pageIndex * pageSize, pageSize],
    ([, ...args]) => fetchLeaderboardData(...args),
    { keepPreviousData: true }
  );

  const total = useMemo(() => {
    if (data && data.success && data.data.success) {
      return data.data.data.total;
    }

    return defaultTotal;
  }, [data, defaultTotal]);

  const rankingData = useMemo(() => {
    if (!data) {
      return participants.map(participantToRankingItem);
    }

    if (data && data.success && data.data.success) {
      return data.data.data.participants.map(participantToRankingItem);
    }

    return [];
  }, [data, participants]);

  const {
    getHeaderGroups,
    getRowModel,
    getPageCount,
    setPageIndex,
    previousPage,
    nextPage,
    getCanPreviousPage,
    getCanNextPage,
  } = useReactTable({
    data: rankingData,
    columns,
    manualPagination: true,
    pageCount: Math.ceil(total / defaultLimit),
    onPaginationChange: setPagination,
    initialState: {
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => {
        return true;
      },
    },
  });

  if (!isLoading && data && !data.success) {
    return <ParseReponseErrorView />;
  }

  if (!isLoading && data && data.success && !data.data.success) {
    return <ParseReponseErrorView errorMessage={data.data.error} />;
  }

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
          />
        </div>
      </div>
      <div className="relative overflow-hidden border rounded-lg border-mono-60">
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
            {getRowModel().rows.length > 0 ? (
              getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell, idx) => (
                    <td key={idx} className="px-2 py-2 md:px-6 md:py-3">
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

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <Spinner size="xl" />
          </div>
        )}
      </div>

      <Pagination
        canNextPage={getCanNextPage()}
        canPreviousPage={getCanPreviousPage()}
        itemsPerPage={pageSize}
        totalItems={total}
        totalPages={getPageCount()}
        previousPage={previousPage}
        nextPage={nextPage}
        page={pageIndex + 1}
        setPageIndex={setPageIndex}
        title="participants"
        className="gap-3 p-0 border-0"
        iconSize="md"
      />
    </div>
  );
};

export default RankingTableView;
