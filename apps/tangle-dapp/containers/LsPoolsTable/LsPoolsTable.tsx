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
import { LsPool, LsPoolDisplayName } from '../../constants/liquidStaking/types';
import {
  Avatar,
  AvatarGroup,
  Button,
  Typography,
} from '@webb-tools/webb-ui-components';
import TokenAmountCell from '../../components/tableCells/TokenAmountCell';
import pluralize from '../../utils/pluralize';
import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import { ArrowRight } from '@webb-tools/icons';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import PercentageCell from '../../components/tableCells/PercentageCell';
import { TableStatus } from '../../components';
import { sharedTableStatusClxs } from '../../components/tables/shared';
import useLsSetStakingIntent from '../../data/liquidStaking/useLsSetStakingIntent';

export type LsPoolsTableProps = {
  pools: LsPool[];
  isShown: boolean;
};

const COLUMN_HELPER = createColumnHelper<LsPool>();

const LsPoolsTable: FC<LsPoolsTableProps> = ({ pools, isShown }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const { lsPoolId } = useLsStore();
  const setLsStakingIntent = useLsSetStakingIntent();

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
          {(
            `${props.row.original.name}#${props.getValue()}` satisfies LsPoolDisplayName
          ).toUpperCase()}
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
    COLUMN_HELPER.accessor('validators', {
      header: () => 'Validators',
      cell: (props) =>
        props.row.original.validators.length === 0 ? (
          EMPTY_VALUE_PLACEHOLDER
        ) : (
          <AvatarGroup total={props.row.original.validators.length}>
            {props.row.original.validators.map((substrateAddress) => (
              <Avatar
                key={substrateAddress}
                sourceVariant="address"
                value={substrateAddress}
                theme="substrate"
              />
            ))}
          </AvatarGroup>
        ),
    }),
    COLUMN_HELPER.accessor('totalStaked', {
      header: () => 'Total Staked (TVL)',
      // TODO: Decimals.
      cell: (props) => <TokenAmountCell amount={props.getValue()} />,
    }),
    COLUMN_HELPER.accessor('commissionPercentage', {
      header: () => 'Commission',
      cell: (props) => <PercentageCell percentage={props.getValue()} />,
    }),
    COLUMN_HELPER.accessor('apyPercentage', {
      header: () => 'APY',
      cell: (props) => <PercentageCell percentage={props.getValue()} />,
    }),
    COLUMN_HELPER.display({
      id: 'actions',
      cell: (props) => (
        <div className="flex items-center justify-end">
          <Button
            isDisabled={lsPoolId === props.row.original.id}
            onClick={() => setLsStakingIntent(props.row.original.id, true)}
            rightIcon={
              lsPoolId !== props.row.original.id ? <ArrowRight /> : undefined
            }
            variant="utility"
            size="sm"
          >
            {lsPoolId === props.row.original.id ? 'Selected' : 'Stake'}
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

  if (pools.length === 0) {
    return (
      <TableStatus
        className={sharedTableStatusClxs}
        title="No pools available yet"
        description="Looks like there are currently no liquid staking pools available for this protocol. Try creating your own pool to get started!"
        icon="🔍"
      />
    );
  }

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

export default LsPoolsTable;
