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
import { ArrowRight, ChainIcon, Search } from '@webb-tools/icons';
import {
  Avatar,
  AvatarGroup,
  Button,
  CopyWithTooltip,
  fuzzyFilter,
  Input,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useMemo, useState } from 'react';

import { GlassCard } from '../components';
import { StringCell } from '../components/tableCells';
import TokenAmountCell from '../components/tableCells/TokenAmountCell';
import ToggleableRadioInput from '../components/ToggleableRadioInput';
import { EMPTY_VALUE_PLACEHOLDER } from '../constants';
import { LsPool } from '../constants/liquidStaking/types';
import useLsPools from '../data/liquidStaking/useLsPools';
import { useLsStore } from '../data/liquidStaking/useLsStore';
import getLsProtocolDef from '../utils/liquidStaking/getLsProtocolDef';
import pluralize from '../utils/pluralize';

const COLUMN_HELPER = createColumnHelper<LsPool>();

const COLUMNS = [
  COLUMN_HELPER.accessor('metadata', {
    header: () => 'Metadata/name',
    cell: (props) => {
      const metadata = props.getValue();

      if (metadata === undefined) {
        return EMPTY_VALUE_PLACEHOLDER;
      }

      return (
        <div className="flex items-center gap-2">
          <ToggleableRadioInput
            isChecked={props.row.getIsSelected()}
            onToggle={() =>
              props.row.toggleSelected(!props.row.getIsSelected())
            }
          />

          <Typography variant="body2" className="whitespace-nowrap">
            {props.getValue()}
          </Typography>

          <CopyWithTooltip textToCopy={metadata} isButton={false} />
        </div>
      );
    },
    sortDescFirst: true,
  }),
  COLUMN_HELPER.accessor('chainId', {
    header: () => 'Chain',
    cell: (props) => {
      const chain = getLsProtocolDef(props.row.original.chainId);

      return (
        <div className="flex items-center gap-2">
          <ChainIcon size="lg" name={chain.chainIconFileName} />

          <Typography variant="body2" className="whitespace-nowrap">
            {chain.name}
          </Typography>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const chainA = getLsProtocolDef(rowA.original.chainId);
      const chainB = getLsProtocolDef(rowB.original.chainId);

      return chainA.name.localeCompare(chainB.name);
    },
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
  COLUMN_HELPER.accessor('ownerStaked', {
    header: () => "Owner's Stake",
    cell: (props) => {
      const protocol = getLsProtocolDef(props.row.original.chainId);

      return (
        <TokenAmountCell
          amount={props.getValue()}
          decimals={protocol.decimals}
          symbol={protocol.token}
        />
      );
    },
  }),
  COLUMN_HELPER.accessor('totalStaked', {
    header: () => 'Total Staked (TVL)',
    cell: (props) => {
      const protocol = getLsProtocolDef(props.row.original.chainId);

      return (
        <TokenAmountCell
          amount={props.getValue()}
          decimals={protocol.decimals}
          symbol={protocol.token}
          className="text-left"
        />
      );
    },
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
    cell: (props) => (
      <StringCell
        value={`${(props.getValue() * 100).toFixed(2)}%`}
        className="text-start"
      />
    ),
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

      assert(selectedRowIds.length <= 1, 'Only one row can ever be selected');

      // TODO: Rows can only be selected, but once selected, one radio input/row must always remain selected.
      setSelectedParachainPoolId(
        selectedRowIds.length > 0 ? selectedRowIds[0] : null,
      );

      setRowSelectionState(newSelectionState);
    },
    [rowSelectionState, setSelectedParachainPoolId],
  );

  // TODO: Handle possible error and loading states.
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

      <GlassCard className="space-y-2">
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          Select Pool
        </Typography>

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
      </GlassCard>
    </div>
  );
};

export default LsPoolsTable;
