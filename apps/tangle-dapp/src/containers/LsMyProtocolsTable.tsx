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
import { ChevronUp } from '@tangle-network/icons';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import {
  AmountFormatStyle,
  Button,
  formatBn,
  formatDisplayAmount,
  Table,
  Typography,
} from '@tangle-network/ui-components';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LsMyPoolsTable, {
  LsMyPoolRow,
} from '../components/LiquidStaking/LsMyPoolsTable';
import StatItem from '../components/StatItem';
import { LsToken } from '../constants/liquidStaking/types';
import useLsMyPools from '../data/liquidStaking/useLsMyPools';
import sortByLocaleCompare from '../utils/sortByLocaleCompare';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import getLsProtocols from '../utils/getLsProtocols';

export type LsMyProtocolRow = {
  name: string;
  tvl: BN;
  myStake: BN;
  myStakeInUsd?: number;
  tvlInUsd?: number;
  iconName: string;
  pools: LsMyPoolRow[];
  token: LsToken;
};

const COLUMN_HELPER = createColumnHelper<LsMyProtocolRow>();

const PROTOCOL_COLUMNS = [
  COLUMN_HELPER.accessor('name', {
    header: () => 'Network & Token',
    sortingFn: sortByLocaleCompare((row) => row.name),
    sortDescFirst: true,
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
  }),
  COLUMN_HELPER.accessor('tvl', {
    header: () => 'Total Staked (TVL)',
    cell: (props) => {
      const formattedTvl = formatBn(props.getValue(), TANGLE_TOKEN_DECIMALS, {
        includeCommas: true,
      });

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
        TANGLE_TOKEN_DECIMALS,
        AmountFormatStyle.SHORT,
      );

      const subtitle =
        props.row.original.myStakeInUsd === undefined
          ? undefined
          : `$${props.row.original.myStakeInUsd}`;

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
    enableSorting: false,
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
  }),
];

const LsMyProtocolsTable: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Expand the first row by default.
  const [expanded, setExpanded] = useState<ExpandedState>({
    0: true,
  });

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
  const network = useNetworkStore((store) => store.network2);

  const rows = useMemo<LsMyProtocolRow[]>(() => {
    // Not yet ready.
    if (network === undefined) {
      return [];
    }

    const protocols = getLsProtocols(network);

    return protocols.map((lsProtocol) => {
      const tvl = myPools.reduce(
        (acc, pool) => acc.add(pool.totalStaked),
        new BN(0),
      );

      const myStake = myPools.reduce(
        (acc, pool) => acc.add(pool.myStake),
        new BN(0),
      );

      return {
        name: lsProtocol.name,
        tvl,
        iconName: 'TNT',
        myStake: myStake,
        pools: myPools,
        token: network.tokenSymbol === 'TNT' ? LsToken.TNT : LsToken.T_TNT,
        // TODO: Calculate the USD value of the TVL.
        tvlInUsd: undefined,
      } satisfies LsMyProtocolRow;
    });
  }, [myPools, network]);

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
