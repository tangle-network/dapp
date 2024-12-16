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
import LsTokenIcon from '@webb-tools/tangle-shared-ui/components/LsTokenIcon';
import TableCellWrapper from '@webb-tools/tangle-shared-ui/components/tables/TableCellWrapper';
import {
  AmountFormatStyle, Button, formatBn,
  formatDisplayAmount, Table, Typography
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LsMyPoolsTable, {
  LsMyPoolRow,
} from '../components/LiquidStaking/LsMyPoolsTable';
import StatItem from '../components/StatItem';
import { LsToken } from '../constants/liquidStaking/types';
import useLsMyPools from '../data/liquidStaking/useLsMyPools';
import { useLsStore } from '../data/liquidStaking/useLsStore';
import getLsNetwork from '../utils/liquidStaking/getLsNetwork';

export type LsMyProtocolRow = {
  name: string;
  tvl: BN;
  myStake: BN;
  tvlInUsd?: number;
  iconName: string;
  pools: LsMyPoolRow[];
  decimals: number;
  token: LsToken;
};

const COLUMN_HELPER = createColumnHelper<LsMyProtocolRow>();

const PROTOCOL_COLUMNS = [
  COLUMN_HELPER.accessor('name', {
    header: () => 'Network & Token',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon
            name={props.row.original.iconName}
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
  COLUMN_HELPER.accessor('myStake', {
    header: () => 'My Stake (Total)',
    cell: (props) => {
      const formattedMyStake = formatDisplayAmount(
        props.getValue(),
        props.row.original.decimals,
        AmountFormatStyle.SHORT,
      );

      const subtitle =
        props.row.original.tvlInUsd === undefined
          ? undefined
          : `$${props.row.original.tvlInUsd}`;

      return (
        <TableCellWrapper>
          <StatItem
            title={`${formattedMyStake} ${props.row.original.token}`}
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
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1">
          <Button variant="utility" isJustIcon>
            <div
              className={twMerge(
                '!text-current transition-transform duration-300 ease-in-out',
                row.getIsExpanded() && 'rotate-180',
              )}
            >
              <ChevronUp className="fill-current dark:fill-current" />
            </div>
          </Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const LsMyProtocolsTable: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { lsNetworkId } = useLsStore();

  // Expand the first row by default.
  const [expanded, setExpanded] = useState<ExpandedState>({
    0: true,
  });

  const lsNetwork = getLsNetwork(lsNetworkId);

  const getExpandedRowContent = useCallback(
    (row: Row<LsMyProtocolRow>) => (
      <LsMyPoolsTable
        pools={row.original.pools}
        isShown={row.getIsExpanded()}
      />
    ),
    [],
  );

  const myPoolsOrNull = useLsMyPools();
  const myPools = useMemo(() => myPoolsOrNull ?? [], [myPoolsOrNull]);

  const rows = useMemo<LsMyProtocolRow[]>(() => {
    return lsNetwork.protocols.map((lsProtocol) => {
      const tvl = myPools
        .filter((myPool) => myPool.protocolId === lsProtocol.id)
        .reduce((acc, pool) => acc.add(pool.totalStaked), new BN(0));

      const myStake = myPools
        .filter((myPool) => myPool.protocolId === lsProtocol.id)
        .reduce((acc, pool) => acc.add(pool.myStake), new BN(0));

      return {
        name: lsProtocol.name,
        tvl,
        iconName: lsProtocol.token,
        myStake: myStake,
        pools: myPools,
        // TODO: Calculate the USD value of the TVL.
        tvlInUsd: undefined,
        token: lsProtocol.token,
        decimals: lsProtocol.decimals,
      } satisfies LsMyProtocolRow;
    });
  }, [lsNetwork.protocols, myPools]);

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
      // Expand the first row by default.
      expanded,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  const onRowClick = useCallback((row: Row<LsMyProtocolRow>) => {
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

export default LsMyProtocolsTable;
