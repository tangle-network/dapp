'use client';

import { BN } from '@polkadot/util';
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
import { FC, useCallback, useState } from 'react';

import { GlassCard } from '../components';
import { StringCell } from '../components/tableCells';
import TokenAmountCell from '../components/tableCells/TokenAmountCell';
import ToggleableRadioInput from '../components/ToggleableRadioInput';
import {
  LsParachainPool,
  LsProtocolId,
} from '../constants/liquidStaking/types';
import getLsProtocolDef from '../utils/liquidStaking/getLsProtocolDef';
import pluralize from '../utils/pluralize';

const COLUMN_HELPER = createColumnHelper<LsParachainPool>();

const COLUMNS = [
  COLUMN_HELPER.accessor('id', {
    header: () => 'Asset ID',
    cell: (props) => (
      <div className="flex items-center gap-2">
        <ToggleableRadioInput
          isChecked={props.row.getIsSelected()}
          onToggle={() => props.row.toggleSelected(!props.row.getIsSelected())}
        />

        <Typography variant="body2" className="whitespace-nowrap">
          {props.getValue()}
        </Typography>

        <CopyWithTooltip textToCopy={props.getValue()} isButton={false} />
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      // NOTE: the sorting is reversed by default
      return rowB.original.id.localeCompare(rowA.original.id);
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
        'None'
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
  COLUMN_HELPER.accessor('commissionPermill', {
    header: () => 'Commission',
    cell: (props) => (
      <StringCell
        value={`${(props.getValue() * 100).toFixed(2)}%`}
        className="text-start"
      />
    ),
  }),
  COLUMN_HELPER.accessor('apyPermill', {
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

export type ParachainPoolsTableProps = {
  setSelectedPoolId: (poolId: string | null) => void;
};

const ParachainPoolsTable: FC<ParachainPoolsTableProps> = ({
  setSelectedPoolId,
}) => {
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
      setSelectedPoolId(selectedRowIds.length > 0 ? selectedRowIds[0] : null);
      setRowSelectionState(newSelectionState);
    },
    [rowSelectionState, setSelectedPoolId],
  );

  const rows: LsParachainPool[] = [
    {
      id: 'abcdXYZ123',
      owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' as any,
      chainId: LsProtocolId.POLKADOT,
      apyPermill: 0.3,
      ownerStaked: new BN(1234560000000000),
      validators: [
        '5FfP4SU5jXY9ZVfR1kY1pUXuJ3G1bfjJoQDRz4p7wSH3Mmdn' as any,
        '5FnL9Pj3NX7E6yC1a2tN4kVdR7y2sAqG8vRsF4PN6yLeu2mL' as any,
        '5CF8H7P3qHfZzBtPXH6G6e3Wc3V2wVn6tQHgYJ5HGKK1eC5z' as any,
        '5GV8vP8Bh3fGZm2P7YNxMzUd9Wy4k3RSRvkq7RXVjxGGM1cy' as any,
        '5DPy4XU6nNV2t2NQkz3QvPB2X5GJ5ZJ1wqMzC4Rxn2WLbXVD' as any,
      ],
      totalStaked: new BN(12300003567),
      commissionPermill: 0.1,
    },
    {
      id: 'zxcvbnm',
      owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' as any,
      chainId: LsProtocolId.POLKADOT,
      apyPermill: 0.3,
      ownerStaked: new BN(123456).mul(new BN(10).pow(new BN(18))),
      validators: [
        '5FfP4SU5jXY9ZVfR1kY1pUXuJ3G1bfjJoQDRz4p7wSH3Mmdn' as any,
        '5FnL9Pj3NX7E6yC1a2tN4kVdR7y2sAqG8vRsF4PN6yLeu2mL' as any,
        '5CF8H7P3qHfZzBtPXH6G6e3Wc3V2wVn6tQHgYJ5HGKK1eC5z' as any,
        '5GV8vP8Bh3fGZm2P7YNxMzUd9Wy4k3RSRvkq7RXVjxGGM1cy' as any,
      ],
      totalStaked: new BN(223456).mul(new BN(10).pow(new BN(18))),
      commissionPermill: 0.1,
    },
  ];

  // TODO: Sort by chain by default, otherwise rows would look messy if there are many pools from different chains.
  const table = useReactTable({
    getRowId: (row) => row.id,
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
        New Vault
      </Button>

      <GlassCard className="space-y-2">
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          Select Token Vault
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

export default ParachainPoolsTable;
