'use client';

import { useState, useMemo, FC } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Table } from '../../../../libs/webb-ui-components/src/components/Table';
import { Pagination } from '../../../../libs/webb-ui-components/src/components/Pagination';
import { twMerge } from 'tailwind-merge';
import { LsPool } from '../../constants/liquidStaking/types';
import {
  Avatar,
  Button,
  getRoundedAmountString,
  Typography,
} from '@webb-tools/webb-ui-components';
import TokenAmountCell from '../../components/tableCells/TokenAmountCell';
import pluralize from '../../utils/pluralize';
import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import { ArrowRight } from '@webb-tools/icons';
import { useLsStore } from '../../data/liquidStaking/useLsStore';

export interface LsPoolsTable2Props {
  pools: LsPool[];
  isShown: boolean;
}

const COLUMN_HELPER = createColumnHelper<LsPool>();

const LsPoolsTable2: FC<LsPoolsTable2Props> = ({ pools, isShown }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const { selectedPoolId, setSelectedPoolId } = useLsStore();

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const columns = [
    COLUMN_HELPER.accessor('id', {
      header: () => 'ID',
      cell: (props) => (
        <Typography
          variant="body2"
          fw="normal"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.row.original.metadata}#{props.getValue()}
        </Typography>
      ),
    }),
    COLUMN_HELPER.accessor('token', {
      header: () => 'Token',
      cell: (props) => (
        <Typography
          variant="body2"
          fw="normal"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue()}
        </Typography>
      ),
    }),
    COLUMN_HELPER.accessor('ownerAddress', {
      header: () => 'Owner',
      cell: (props) => (
        <Avatar
          sourceVariant="address"
          value={props.row.original.ownerAddress}
          theme="substrate"
        />
      ),
    }),
    COLUMN_HELPER.accessor('totalStaked', {
      header: () => 'TVL',
      // TODO: Decimals.
      cell: (props) => <TokenAmountCell amount={props.getValue()} />,
    }),
    COLUMN_HELPER.accessor('apyPercentage', {
      header: () => 'APY',
      cell: (props) => {
        const apy = props.getValue();

        if (apy === undefined) {
          return EMPTY_VALUE_PLACEHOLDER;
        }

        return (
          <Typography
            variant="body2"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            {getRoundedAmountString(props.getValue()) + '%'}
          </Typography>
        );
      },
    }),
    COLUMN_HELPER.display({
      id: 'actions',
      cell: (props) => (
        <div className="flex items-center justify-end">
          <Button
            isDisabled={selectedPoolId === props.row.original.id}
            onClick={() => setSelectedPoolId(props.row.original.id)}
            rightIcon={<ArrowRight />}
            variant="utility"
            size="sm"
          >
            Stake
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: pools,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <div className="flex flex-col">
      <Table
        tableProps={table}
        title="Assets"
        className={twMerge(
          'rounded-2xl overflow-hidden bg-mono-20 dark:bg-mono-200 px-3',
          isShown ? 'animate-slide-down' : 'animate-slide-up',
        )}
        thClassName="py-3 !font-normal !bg-transparent border-t-0 border-b text-mono-120 dark:text-mono-100 border-mono-60 dark:border-mono-160"
        tbodyClassName="!bg-transparent"
        tdClassName="!bg-inherit border-t-0"
      />

      <Pagination
        itemsPerPage={pageSize}
        totalItems={pools.length}
        page={pageIndex + 1}
        totalPages={table.getPageCount()}
        canPreviousPage={table.getCanPreviousPage()}
        previousPage={table.previousPage}
        canNextPage={table.getCanNextPage()}
        nextPage={table.nextPage}
        setPageIndex={table.setPageIndex}
        title={pluralize('pool', pools.length === 0 || pools.length > 1)}
        className="border-t-0 py-5"
      />
    </div>
  );
};

export default LsPoolsTable2;
