'use client';

import { useState, useCallback, useMemo, FC } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Row,
  createColumnHelper,
} from '@tanstack/react-table';
import { Table } from '../../../../libs/webb-ui-components/src/components/Table';
import { Typography } from '../../../../libs/webb-ui-components/src/typography';
import { twMerge } from 'tailwind-merge';
import LsPoolsTable from './LsPoolsTable';
import TableCellWrapper from '../../components/tables/TableCellWrapper';
import LsTokenIcon from '../../components/LsTokenIcon';
import StatItem from '../../components/StatItem';
import { Button, getRoundedAmountString } from '@webb-tools/webb-ui-components';
import { ChevronUp } from '@webb-tools/icons';
import { LsPool } from '../../constants/liquidStaking/types';
import pluralize from '../../utils/pluralize';
import useLsPools from '../../data/liquidStaking/useLsPools';

export interface LsProtocolsTableProps {
  initialSorting?: SortingState;
}

export type LsProtocolRow = {
  name: string;
  tvl: number;
  tvlInUsd: number;
  iconName: string;
  pools: LsPool[];
};

const COLUMN_HELPER = createColumnHelper<LsProtocolRow>();

const PROTOCOL_COLUMNS = [
  COLUMN_HELPER.accessor('name', {
    header: () => 'Token',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon name={props.row.original.iconName} size="lg" />

          <Typography variant="h5" className="whitespace-nowrap">
            {props.getValue()}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
    sortingFn: (rowA, rowB) => {
      // NOTE: The sorting is reversed by default.
      return rowB.original.name.localeCompare(rowA.original.name);
    },
    sortDescFirst: true,
  }),
  COLUMN_HELPER.accessor('tvl', {
    header: () => 'Total Staked (TVL)',
    cell: (props) => (
      <TableCellWrapper>
        <StatItem
          title={`${getRoundedAmountString(props.getValue())} UNIT HERE`}
          subtitle={`$${props.row.original.tvlInUsd}`}
          removeBorder
        />
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('pools', {
    header: () => 'Pools',
    cell: (props) => {
      const length = props.getValue().length;

      return (
        <TableCellWrapper>
          <StatItem
            title={length.toString()}
            subtitle={pluralize('Pool', length === 0 || length > 1)}
            removeBorder
          />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.display({
    id: 'expand/collapse',
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeBorder>
        <div className="flex items-center justify-end flex-1">
          <Button variant="utility" isJustIcon>
            <div
              className={twMerge(
                '!text-current transition-transform duration-300 ease-in-out',
                row.getIsExpanded() ? 'rotate-180' : '',
              )}
            >
              <ChevronUp className={twMerge('!fill-current')} />
            </div>
          </Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

// TODO: Have the first row be expanded by default.
const LsProtocolsTable: FC<LsProtocolsTableProps> = ({
  initialSorting = [],
}) => {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const getExpandedRowContent = useCallback(
    (row: Row<LsProtocolRow>) => (
      <div className="bg-mono-0 dark:bg-mono-190 -mt-7 pt-3 rounded-b-xl -mx-px px-3">
        <LsPoolsTable
          pools={row.original.pools}
          isShown={row.getIsExpanded()}
        />
      </div>
    ),
    [],
  );

  const lsPools = useLsPools();

  const pools = useMemo<LsPool[]>(() => {
    if (!(lsPools instanceof Map)) {
      return [];
    }

    return Array.from(lsPools.values());
  }, [lsPools]);

  // TODO: Dummy data. Need to load actual protocol data or list it if it's hardcoded/limited to a few.
  const protocols: LsProtocolRow[] = [
    {
      iconName: 'tangle',
      name: 'Tangle',
      pools: pools,
      tvl: 123.4567,
      tvlInUsd: 123.3456,
    },
  ];

  const table = useReactTable({
    data: protocols,
    columns: PROTOCOL_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  const onRowClick = useCallback(
    (row: Row<LsProtocolRow>) => {
      table.setExpanded({ [row.id]: !row.getIsExpanded() });
    },
    [table],
  );

  return (
    <Table
      tableProps={table}
      getExpandedRowContent={getExpandedRowContent}
      onRowClick={onRowClick}
      className={twMerge(
        'px-6 rounded-2xl overflow-hidden border border-mono-0 dark:border-mono-160',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)]',
        'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]',
      )}
      tableClassName="border-separate border-spacing-y-3 pt-3"
      thClassName="py-0 border-t-0 !bg-transparent font-normal text-mono-120 dark:text-mono-100 border-b-0"
      tbodyClassName="!bg-transparent"
      trClassName="group cursor-pointer overflow-hidden rounded-xl"
      tdClassName="border-0 !p-0 first:rounded-l-xl last:rounded-r-xl overflow-hidden"
    />
  );
};

export default LsProtocolsTable;
