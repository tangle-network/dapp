import { Search } from '@tangle-network/icons';
import {
  assertSubstrateAddress,
  Input,
  Pagination,
  Table,
  Typography,
  ValidatorIdentity,
} from '@tangle-network/ui-components';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo, useState } from 'react';
import { AccountType, fetchAccounts } from '../../data/fetchAccounts';
import { QueryKeyEnum } from '../../types/QueryKeyEnum';
import BadgesCell from './BadgesCell';
import HeaderCell from './HeaderCell';

const COLUMN_HELPER = createColumnHelper<AccountType>();

const getColumns = (pageIndex: number, pageSize: number) => [
  COLUMN_HELPER.accessor('id', {
    id: 'rank',
    header: () => <HeaderCell title="Rank" />,
    cell: (cellCtx) => {
      const globalRowIndex = cellCtx.row.index + pageIndex * pageSize;
      return (
        <Typography variant="mkt-small-caps" fw="bold">
          #{globalRowIndex + 1}
        </Typography>
      );
    },
  }),

  COLUMN_HELPER.accessor('id', {
    header: () => <HeaderCell title="Address" />,
    cell: (cellCtx) => (
      <ValidatorIdentity address={assertSubstrateAddress(cellCtx.getValue())} />
    ),
  }),

  COLUMN_HELPER.accessor('badges', {
    header: () => <HeaderCell title="Badges" />,
    cell: (badges) => <BadgesCell badges={badges.getValue()} />,
  }),
];

export const RankingTable: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data } = useSuspenseQuery({
    queryKey: [QueryKeyEnum.LEADERBOARD, pageIndex, pageSize, searchTerm],
    queryFn: () => fetchAccounts(pageSize, pageIndex * pageSize, searchTerm),
  });

  const columns = useMemo(
    () => getColumns(pageIndex, pageSize),
    [pageIndex, pageSize],
  );

  const pageCount = useMemo(() => {
    return Math.ceil(data.pagination.total / pageSize);
  }, [data.pagination.total, pageSize]);

  const table = useReactTable({
    data: data.data,
    columns,
    manualPagination: true,
    pageCount,
    onPaginationChange: setPagination,
    initialState: {
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <Typography variant="h4" fw="bold">
          Latest ranking:
        </Typography>

        <div className="flex items-center gap-2 w-max md:w-1/2">
          <Typography variant="body1" fw="bold">
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

      <div className="border rounded-lg border-mono-0 dark:border-mono-160">
        <Table tableProps={table} />

        <Pagination
          canNextPage={table.getCanNextPage()}
          canPreviousPage={table.getCanPreviousPage()}
          itemsPerPage={pageSize}
          totalItems={data.pagination.total}
          totalPages={pageCount}
          previousPage={table.previousPage}
          nextPage={table.nextPage}
          page={pageIndex + 1}
          setPageIndex={table.setPageIndex}
          title="participants"
        />
      </div>
    </div>
  );
};
