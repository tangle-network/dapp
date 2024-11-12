'use client';

import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronUp } from '@webb-tools/icons';
import { Button, Table, Typography } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LsTokenIcon from '../../components/LsTokenIcon';
import StatItem from '../../components/StatItem';
import TableCellWrapper from '../../components/tables/TableCellWrapper';
import { LsPool, LsToken } from '../../constants/liquidStaking/types';
import useLsPools from '../../data/liquidStaking/useLsPools';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import formatBn from '../../utils/formatBn';
import getLsNetwork from '../../utils/liquidStaking/getLsNetwork';
import pluralize from '../../utils/pluralize';
import LsPoolsTable from './LsPoolsTable';

export type LsProtocolRow = {
  name: string;
  tvl: BN;
  tvlInUsd?: number;
  token: LsToken;
  pools: LsPool[];
  decimals: number;
};

const COLUMN_HELPER = createColumnHelper<LsProtocolRow>();

const PROTOCOL_COLUMNS = [
  COLUMN_HELPER.accessor('name', {
    header: () => 'Network & Token',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon
            name={props.row.original.token}
            hasRainbowBorder
            size="lg"
          />

          <Typography variant="h5" className="whitespace-nowrap">
            {props.getValue()} &mdash; {props.row.original.token}
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
    cell: (props) => {
      const formattedTvl = formatBn(
        props.getValue(),
        props.row.original.decimals,
        { includeCommas: true },
      );

      const subtitle =
        props.row.original.tvlInUsd === undefined
          ? undefined
          : `$${props.row.original.tvlInUsd}`;

      return (
        <TableCellWrapper>
          <StatItem
            title={`${formattedTvl} ${props.row.original.token}`}
            subtitle={subtitle}
            removeBorder
          />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('pools', {
    header: () => 'Pools',
    cell: (props) => {
      const length = props.getValue().length;

      return (
        <TableCellWrapper removeRightBorder>
          <StatItem
            title={length.toString()}
            subtitle={pluralize('Pool', length !== 1)}
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
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1">
          <Button variant="utility" isJustIcon>
            <div
              className={twMerge(
                '!text-current transition-transform duration-300 ease-in-out',
                row.getIsExpanded() && 'rotate-180',
              )}
            >
              <ChevronUp className="!fill-current" />
            </div>
          </Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const LsProtocolsTable: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { lsNetworkId } = useLsStore();

  // Expand the first row by default.
  const [expanded, setExpanded] = useState<ExpandedState>({
    0: true,
  });

  const lsNetwork = getLsNetwork(lsNetworkId);

  const getExpandedRowContent = useCallback(
    (row: Row<LsProtocolRow>) => (
      <LsPoolsTable pools={row.original.pools} isShown={row.getIsExpanded()} />
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

  const rows = useMemo<LsProtocolRow[]>(() => {
    return lsNetwork.protocols.map((lsProtocol) => {
      const tvl = pools
        .filter((pool) => pool.protocolId === lsProtocol.id)
        .reduce((acc, pool) => acc.add(pool.totalStaked), new BN(0));

      return {
        name: lsProtocol.name,
        tvl,
        token: lsProtocol.token,
        pools: pools,
        // TODO: Calculate the USD value of the TVL.
        tvlInUsd: undefined,
        decimals: lsProtocol.decimals,
      } satisfies LsProtocolRow;
    });
  }, [lsNetwork.protocols, pools]);

  const table = useReactTable({
    data: rows,
    columns: PROTOCOL_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      expanded,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  const onRowClick = useCallback((row: Row<LsProtocolRow>) => {
    row.toggleExpanded();
  }, []);

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
