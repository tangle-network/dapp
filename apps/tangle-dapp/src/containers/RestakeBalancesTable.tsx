'use client';

import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  AmountFormatStyle,
  Button,
  EMPTY_VALUE_PLACEHOLDER,
  formatBn,
  formatDisplayAmount,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { FC, useMemo, useState } from 'react';

import LsTokenIcon from '../components/LsTokenIcon';
import StatItem from '../components/StatItem';
import TableCellWrapper from '../components/tables/TableCellWrapper';
import useLsMyPools from '../data/liquidStaking/useLsMyPools';
import { useLsStore } from '../data/liquidStaking/useLsStore';
import getLsNetwork from '../utils/liquidStaking/getLsNetwork';
import { HeaderCell } from '../components/tableCells';
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';

export type RestakeBalanceRow = {
  name: string;
  token: string;
  tvl: BN;
  tvlInUsd?: number;
  available: BN;
  availableInUsd?: number;
  locked: BN;
  lockedInUsd?: number;
  points?: number;
  iconName: string;
  decimals: number;
};

const COLUMN_HELPER = createColumnHelper<RestakeBalanceRow>();

const PROTOCOL_COLUMNS = [
  COLUMN_HELPER.accessor('name', {
    header: () => 'Asset',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon name={props.row.original.iconName} size="lg" />

          <Typography variant="h5" className="whitespace-nowrap">
            {props.getValue()}
          </Typography>

          <Typography
            variant="body1"
            className="whitespace-nowrap dark:text-mono-100"
          >
            {props.row.original.token}
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
  COLUMN_HELPER.accessor('available', {
    header: () => 'Available',
    cell: (props) => {
      const formattedMyStake = formatDisplayAmount(
        props.getValue(),
        props.row.original.decimals,
        AmountFormatStyle.SHORT,
      );

      const subtitle =
        props.row.original.availableInUsd === undefined
          ? undefined
          : `$${props.row.original.availableInUsd}`;

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
  COLUMN_HELPER.accessor('locked', {
    header: () => 'Locked/Restaked',
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
  COLUMN_HELPER.accessor('tvl', {
    header: () => (
      <HeaderCell title="TVL/CAP" tooltip="Total value locked & market cap." />
    ),
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
  COLUMN_HELPER.accessor('points', {
    header: () => (
      <HeaderCell
        title="Points"
        tooltip="Points are relevant for the upcoming airdrop campaign."
      />
    ),
    cell: (props) => {
      const points = props.getValue();

      if (points === undefined) {
        return EMPTY_VALUE_PLACEHOLDER;
      }

      return (
        <TableCellWrapper>
          <Typography variant="h5">{addCommasToNumber(points)}</Typography>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.display({
    id: 'restake-action',
    header: () => null,
    cell: () => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1">
          <Button variant="utility">Restake</Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const RestakeBalancesTable: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { lsNetworkId } = useLsStore();

  const lsNetwork = getLsNetwork(lsNetworkId);

  const myPoolsOrNull = useLsMyPools();
  const myPools = useMemo(() => myPoolsOrNull ?? [], [myPoolsOrNull]);

  const rows = useMemo<RestakeBalanceRow[]>(() => {
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
        available: myStake,
        // TODO: Calculate the USD value once appropriate hook is available.
        availableInUsd: undefined,
        locked: tvl.sub(myStake),
        // TODO: Calculate the USD value once appropriate hook is available.
        lockedInUsd: undefined,
        // TODO: Calculate the USD value once appropriate hook is available.
        tvlInUsd: undefined,
        token: lsProtocol.token,
        decimals: lsProtocol.decimals,
      } satisfies RestakeBalanceRow;
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
    state: {
      sorting,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return <Table variant={TableVariant.GLASS_OUTER} tableProps={table} />;
};

export default RestakeBalancesTable;
