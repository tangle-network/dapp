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
  formatDisplayAmount,
  Table,
  Typography,
} from '@tangle-network/ui-components';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import StatItem from '../../components/StatItem';
import { LsPool, LsToken } from '../../constants/liquidStaking/types';
import useLsPools from '../../data/liquidStaking/useLsPools';
import LsPoolsTable from './LsPoolsTable';
import sortByLocaleCompare from '../../utils/sortByLocaleCompare';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import getLsProtocols from '../../utils/getLsProtocols';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

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
    sortingFn: sortByLocaleCompare((row) => row.name),
    sortDescFirst: true,
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
  }),
  COLUMN_HELPER.accessor('tvl', {
    header: () => 'Total Staked (TVL)',
    cell: (props) => {
      const formattedTvl = formatDisplayAmount(
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
  const network = useNetworkStore((store) => store.network2);

  // Expand the first row by default.
  const [expanded, setExpanded] = useState<ExpandedState>({
    0: true,
  });

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

    // Only include open pools.
    return Array.from(lsPools.values()).filter((pool) => pool.state === 'Open');
  }, [lsPools]);

  const rows = useMemo<LsProtocolRow[]>(() => {
    // Not yet ready.
    if (network === undefined) {
      return [];
    }

    const protocols = getLsProtocols(network);

    return protocols.map((lsProtocol) => {
      const tvl = pools.reduce(
        (acc, pool) => acc.add(pool.totalStaked),
        new BN(0),
      );

      return {
        name: lsProtocol.name,
        tvl,
        token: network.tokenSymbol === 'TNT' ? LsToken.TNT : LsToken.T_TNT,
        pools: pools,
        decimals: TANGLE_TOKEN_DECIMALS,
        // TODO: Calculate the USD value of the TVL.
        tvlInUsd: undefined,
      } satisfies LsProtocolRow;
    });
  }, [network, pools]);

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
