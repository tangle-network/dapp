'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  Updater,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowRight, Search } from '@webb-tools/icons';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Button,
  CopyWithTooltip,
  fuzzyFilter,
  Input,
  Table,
  TANGLE_DOCS_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useMemo, useState } from 'react';

import { GlassCard, TableStatus } from '../components';
import TableRowsSkeleton from '../components/LiquidStaking/TableRowsSkeleton';
import { StringCell } from '../components/tableCells';
import TokenAmountCell from '../components/tableCells/TokenAmountCell';
import { EMPTY_VALUE_PLACEHOLDER } from '../constants';
import { LsPool } from '../constants/liquidStaking/types';
import useLsPools from '../data/liquidStaking/useLsPools';
import { useLsStore } from '../data/liquidStaking/useLsStore';
import RadioInput from '../data/liquidStaking/useLsValidatorSelectionTableColumns';
import pluralize from '../utils/pluralize';

const COLUMN_HELPER = createColumnHelper<LsPool>();

const COLUMNS = [
  COLUMN_HELPER.accessor('metadata', {
    header: () => 'Name',
    cell: (props) => {
      const metadata = props.getValue();

      return (
        <div className="flex items-center gap-2">
          <RadioInput
            checked={props.row.getIsSelected()}
            onChange={(e) => props.row.toggleSelected(e.target.checked)}
          />

          {metadata === undefined ? (
            EMPTY_VALUE_PLACEHOLDER
          ) : (
            <>
              <Typography variant="body2" className="whitespace-nowrap">
                {props.getValue()}
              </Typography>

              <CopyWithTooltip textToCopy={metadata} isButton={false} />
            </>
          )}
        </div>
      );
    },
    sortDescFirst: true,
  }),
  COLUMN_HELPER.accessor('owner', {
    header: () => 'Owner',
    cell: (props) => (
      <Avatar
        sourceVariant="address"
        value={props.row.original.owner}
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
  COLUMN_HELPER.accessor('ownerStake', {
    header: () => "Owner's Stake",
    cell: (props) => <TokenAmountCell amount={props.getValue()} />,
  }),
  COLUMN_HELPER.accessor('totalStaked', {
    header: () => 'Total Staked (TVL)',
    cell: (props) => (
      <TokenAmountCell amount={props.getValue()} className="text-left" />
    ),
  }),
  COLUMN_HELPER.accessor('commissionPercentage', {
    header: () => 'Commission',
    cell: (props) => {
      const commissionPercentage = props.getValue();

      if (commissionPercentage === undefined) {
        return EMPTY_VALUE_PLACEHOLDER;
      }

      return (
        <StringCell
          value={`${(commissionPercentage * 100).toFixed(2)}%`}
          className="text-start"
        />
      );
    },
  }),
  COLUMN_HELPER.accessor('apyPercentage', {
    header: () => 'APY',
    cell: (props) => {
      const apyPercentage = props.getValue();

      if (apyPercentage === undefined) {
        return EMPTY_VALUE_PLACEHOLDER;
      }

      return (
        <StringCell
          value={`${(apyPercentage * 100).toFixed(2)}%`}
          className="text-start"
        />
      );
    },
  }),
];

const DEFAULT_PAGINATION_STATE: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};

const LsPoolsTable: FC = () => {
  const { setSelectedParachainPoolId } = useLsStore();
  const [searchQuery, setSearchQuery] = useState('');

  const [paginationState, setPaginationState] = useState<PaginationState>(
    DEFAULT_PAGINATION_STATE,
  );

  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>(
    {},
  );

  const handleRowSelectionChange = useCallback(
    (updaterOrValue: Updater<RowSelectionState>) => {
      const newSelectionState =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(rowSelectionState)
          : updaterOrValue;

      const selectedRowIds = Object.keys(newSelectionState).filter(
        (rowId) => newSelectionState[rowId],
      );

      const selectedRow = selectedRowIds.at(0);

      assert(selectedRow !== undefined, 'One row must always be selected');
      setSelectedParachainPoolId(selectedRow);
      setRowSelectionState(newSelectionState);
    },
    [rowSelectionState, setSelectedParachainPoolId],
  );

  const poolsMap = useLsPools();

  const rows: LsPool[] = useMemo(() => {
    return poolsMap instanceof Map ? Array.from(poolsMap.values()) : [];
  }, [poolsMap]);

  // TODO: Sort by chain by default, otherwise rows would look messy if there are many pools from different chains.
  const table = useReactTable({
    getRowId: (row) => row.id.toString(),
    data: rows,
    columns: COLUMNS,
    state: {
      rowSelection: rowSelectionState,
      globalFilter: searchQuery,
      pagination: paginationState,
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    // Use radio-style, single-row selection.
    enableMultiRowSelection: false,
    onPaginationChange: setPaginationState,
    onRowSelectionChange: handleRowSelectionChange,
    onGlobalFilterChange: (newSearchQuery) => {
      setPaginationState(DEFAULT_PAGINATION_STATE);
      setSearchQuery(newSearchQuery);
    },
  });

  return (
    <div className="flex flex-col items-end justify-center gap-2">
      <Button variant="utility" size="sm" rightIcon={<ArrowRight />}>
        Create Pool
      </Button>

      <GlassCard className="space-y-2 px-10">
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          Select Pool
        </Typography>

        {poolsMap === null ? (
          <TableRowsSkeleton className="h-10" />
        ) : poolsMap instanceof Error ? (
          <Alert
            type="error"
            title="Unable to display pools"
            description={poolsMap.message}
          />
        ) : rows.length === 0 ? (
          <TableStatus
            className="bg-transparent dark:bg-transparent border-none"
            title="No pools available yet"
            description="Looks like there's currently no liquid staking pools available. Try creating your own pool to get started!"
            icon="🔍"
            buttonText="Learn More"
            buttonProps={{
              // TODO: Link to liquid staking pools docs page once implemented.
              href: TANGLE_DOCS_URL,
              target: '_blank',
            }}
          />
        ) : (
          <>
            <Input
              id="ls-search-parachain-pools"
              placeholder="Search and filter pools..."
              value={searchQuery}
              onChange={(newValue) => setSearchQuery(newValue)}
              isControlled
              rightIcon={<Search className="mr-2" />}
            />

            <Table
              tableProps={table}
              title={pluralize('pool', rows.length > 1)}
              isPaginated
              totalRecords={rows.length}
              thClassName="!bg-inherit border-t-0 bg-mono-0 !px-3 !py-2 whitespace-nowrap"
              trClassName="!bg-inherit"
              tdClassName="!bg-inherit !px-3 !py-2 whitespace-nowrap"
            />
          </>
        )}
      </GlassCard>
    </div>
  );
};

export default LsPoolsTable;
