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
import { Table } from '../../../libs/webb-ui-components/src/components/Table';
import { Pagination } from '../../../libs/webb-ui-components/src/components/Pagination';
import { LsPool } from '../constants/liquidStaking/types';
import {
  ActionsDropdown,
  Avatar,
  Button,
  getRoundedAmountString,
  Typography,
} from '@webb-tools/webb-ui-components';
import TokenAmountCell from '../components/tableCells/TokenAmountCell';
import pluralize from '../utils/pluralize';
import { EMPTY_VALUE_PLACEHOLDER } from '../constants';
import { ArrowRight } from '@webb-tools/icons';
import useLsPools from '../data/liquidStaking/useLsPools';
import useSubstrateAddress from '../hooks/useSubstrateAddress';
import { BN } from '@polkadot/util';
import assert from 'assert';
import { GlassCard } from '../components';

type MyLsPoolRow = LsPool & {
  myStake: BN;
  isRoot: boolean;
  isNominator: boolean;
  isBouncer: boolean;
};

const COLUMN_HELPER = createColumnHelper<MyLsPoolRow>();

const POOL_COLUMNS = [
  COLUMN_HELPER.accessor('id', {
    header: () => 'Name/id',
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
  COLUMN_HELPER.accessor('myStake', {
    header: () => 'My Stake',
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
    header: () => 'Actions',
    cell: (props) => (
      <div>
        <Button rightIcon={<ArrowRight />} variant="utility">
          Unstake
        </Button>

        {/**
         * Show management actions if the active user has any role in
         * the pool.
         */}
        {props.row.original.isRoot ||
          props.row.original.isNominator ||
          (props.row.original.isBouncer && (
            <ActionsDropdown
              buttonText="Manage"
              // TODO: Conditionally render actions based on the user's roles.
              actionItems={[
                {
                  label: 'Update Nominations',
                  // TODO: Proper onClick handler.
                  onClick: () => void 0,
                },
                {
                  label: 'Update Commission',
                  // TODO: Proper onClick handler.
                  onClick: () => void 0,
                },
                {
                  label: 'Update Roles',
                  // TODO: Proper onClick handler.
                  onClick: () => void 0,
                },
              ]}
            />
          ))}
      </div>
    ),
  }),
];

const LsMyPoolsTable: FC = () => {
  const substrateAddress = useSubstrateAddress();
  const [sorting, setSorting] = useState<SortingState>([]);

  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const lsPoolsMap = useLsPools();

  const lsPools =
    lsPoolsMap instanceof Map ? Array.from(lsPoolsMap.values()) : lsPoolsMap;

  const rows: MyLsPoolRow[] = useMemo(() => {
    if (substrateAddress === null || !Array.isArray(lsPools)) {
      return [];
    }

    return lsPools
      .filter((lsPool) => lsPool.members.has(substrateAddress))
      .map((lsPool) => {
        const account = lsPool.members.get(substrateAddress);

        assert(account !== undefined);

        return {
          ...lsPool,
          myStake: account.balance.toBn(),
          isRoot: lsPool.ownerAddress === substrateAddress,
          isNominator: lsPool.nominatorAddress === substrateAddress,
          isBouncer: lsPool.bouncerAddress === substrateAddress,
        };
      });
  }, []);

  const table = useReactTable({
    data: rows,
    columns: POOL_COLUMNS,
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
    <GlassCard>
      <div className="flex flex-col">
        <Table
          tableProps={table}
          title="Assets"
          className="rounded-2xl overflow-hidden bg-mono-20 dark:bg-mono-200 px-3"
          thClassName="py-3 !font-normal !bg-transparent border-t-0 border-b text-mono-120 dark:text-mono-100 border-mono-60 dark:border-mono-160"
          tbodyClassName="!bg-transparent"
          tdClassName="!bg-inherit border-t-0"
        />

        <Pagination
          itemsPerPage={pageSize}
          totalItems={rows.length}
          page={pageIndex + 1}
          totalPages={table.getPageCount()}
          canPreviousPage={table.getCanPreviousPage()}
          previousPage={table.previousPage}
          canNextPage={table.getCanNextPage()}
          nextPage={table.nextPage}
          setPageIndex={table.setPageIndex}
          title={pluralize('pool', rows.length === 0 || rows.length > 1)}
          className="border-t-0 py-5"
        />
      </div>
    </GlassCard>
  );
};

export default LsMyPoolsTable;
