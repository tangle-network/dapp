'use client';

import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  Updater,
  useReactTable,
} from '@tanstack/react-table';
import { Table, Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import StatItem from '../components/StatItem';
import TokenAmountCell from '../components/tableCells/TokenAmountCell';
import TableCellWrapper from '../components/tables/TableCellWrapper';
import ToggleableRadioInput from '../components/ToggleableRadioInput';
import {
  LsParachainPool,
  LsProtocolId,
} from '../constants/liquidStaking/types';
import getLsProtocolDef from '../utils/liquidStaking/getLsProtocolDef';

const COLUMN_HELPER = createColumnHelper<LsParachainPool>();

const COLUMNS = [
  COLUMN_HELPER.accessor('id', {
    header: () => 'Asset ID',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <ToggleableRadioInput
            isChecked={props.row.getIsSelected()}
            onToggle={() =>
              props.row.toggleSelected(!props.row.getIsSelected())
            }
          />

          <Typography variant="h5" className="whitespace-nowrap">
            {props.getValue()}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
    sortingFn: (rowA, rowB) => {
      // NOTE: the sorting is reversed by default
      return rowB.original.id.localeCompare(rowA.original.id);
    },
    sortDescFirst: true,
  }),
  COLUMN_HELPER.accessor('validators', {
    header: () => 'Validators',
    cell: (props) => (
      <TableCellWrapper>
        <StatItem
          title={`${props.getValue()}`}
          subtitle="Tokens"
          removeBorder
        />
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('ownerStaked', {
    header: () => "Owner's Stake",
    cell: (props) => {
      const protocol = getLsProtocolDef(props.row.original.chainId);

      return (
        <TableCellWrapper>
          <TokenAmountCell
            amount={props.getValue()}
            decimals={protocol.decimals}
            symbol={protocol.token}
          />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('totalStaked', {
    header: () => 'Total Staked (TVL)',
    cell: (props) => {
      const protocol = getLsProtocolDef(props.row.original.chainId);

      return (
        <TableCellWrapper>
          <TokenAmountCell
            amount={props.getValue()}
            decimals={protocol.decimals}
            symbol={protocol.token}
          />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('apyPermill', {
    header: () => 'APY',
    cell: (props) => (
      <TableCellWrapper removeBorder>
        <StatItem
          title={`${(props.getValue() * 100).toFixed(2)}%`}
          subtitle="Per Annum"
          removeBorder
        />
      </TableCellWrapper>
    ),
  }),
];

export type ParachainPoolsTableProps = {
  setSelectedPoolId: (poolId: string | null) => void;
};

const ParachainPoolsTable: FC<ParachainPoolsTableProps> = ({
  setSelectedPoolId,
}) => {
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
      ownerStaked: new BN(123456).mul(new BN(10).pow(new BN(18))),
      validators: [],
      totalStaked: new BN(223456).mul(new BN(10).pow(new BN(18))),
    },
  ];

  // TODO: Row selection not updating/refreshing the UI.
  const table = useReactTable({
    data: rows,
    columns: COLUMNS,
    state: {
      rowSelection: rowSelectionState,
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    // Use radio-style, single-row selection.
    enableMultiRowSelection: false,
    onRowSelectionChange: handleRowSelectionChange,
  });

  return (
    <Table
      tableProps={table}
      title="Select Token Vault"
      className={twMerge(
        'px-6 rounded-2xl overflow-hidden border border-mono-0 dark:border-mono-160',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)]',
        'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]',
      )}
      tableClassName="border-separate border-spacing-y-3 pt-3"
      thClassName="py-0 border-t-0 !bg-transparent font-normal text-mono-120 dark:text-mono-100 border-b-0"
      tbodyClassName="!bg-transparent"
      trClassName="group overflow-hidden rounded-xl"
      tdClassName="border-0 !p-0 first:rounded-l-xl last:rounded-r-xl overflow-hidden"
      paginationClassName="!bg-transparent dark:!bg-transparent pl-6 border-t-0 -mt-2"
    />
  );
};

export default ParachainPoolsTable;
