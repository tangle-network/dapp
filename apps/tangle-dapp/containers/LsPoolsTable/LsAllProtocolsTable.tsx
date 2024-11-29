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
import TableCellWrapper from '@webb-tools/tangle-shared-ui/components/tables/TableCellWrapper';
import { Button, Table, Typography } from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LsTokenIcon from '../../components/LsTokenIcon';
import StatItem from '../../components/StatItem';
import { LsPool, LsToken } from '../../constants/liquidStaking/types';
import useLsPools from '../../data/liquidStaking/useLsPools';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import formatBn from '../../utils/formatBn';
import getLsNetwork from '../../utils/liquidStaking/getLsNetwork';
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

const LsAllProtocolsTable: FC = () => {
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
      variant={TableVariant.GLASS_OUTER}
      tableProps={table}
      getExpandedRowContent={getExpandedRowContent}
      onRowClick={onRowClick}
    />
  );
};

export default LsAllProtocolsTable;
