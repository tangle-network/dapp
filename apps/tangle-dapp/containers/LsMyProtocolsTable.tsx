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
import assert from 'assert';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LsMyPoolsTable, {
  LsMyPoolRow,
} from '../components/LiquidStaking/LsMyPoolsTable';
import LsTokenIcon from '../components/LsTokenIcon';
import StatItem from '../components/StatItem';
import TableCellWrapper from '../components/tables/TableCellWrapper';
import { LsProtocolId, LsToken } from '../constants/liquidStaking/types';
import useLsPools from '../data/liquidStaking/useLsPools';
import { useLsStore } from '../data/liquidStaking/useLsStore';
import useSubstrateAddress from '../hooks/useSubstrateAddress';
import formatBn from '../utils/formatBn';
import getLsNetwork from '../utils/liquidStaking/getLsNetwork';
import pluralize from '../utils/pluralize';

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
      const formattedMyStake = formatBn(
        props.getValue(),
        props.row.original.decimals,
      );

      return (
        <TableCellWrapper>
          <StatItem
            title={`${formattedMyStake} ${props.row.original.token}`}
            // TODO: Calculate the USD value of the stake.
            subtitle={`$${props.row.original.tvlInUsd}`}
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
              <ChevronUp className="!fill-current" />
            </div>
          </Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const LsMyProtocolsTable: FC = () => {
  const substrateAddress = useSubstrateAddress();
  const [sorting, setSorting] = useState<SortingState>([]);
  const { lsNetworkId } = useLsStore();
  const lsPools = useLsPools();

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

  const myPools: LsMyPoolRow[] = useMemo(() => {
    if (substrateAddress === null || !(lsPools instanceof Map)) {
      return [];
    }

    const lsPoolsArray = Array.from(lsPools.values());

    return lsPoolsArray
      .filter((lsPool) => lsPool.members.has(substrateAddress))
      .map((lsPool) => {
        const account = lsPool.members.get(substrateAddress);

        assert(account !== undefined);

        return {
          ...lsPool,
          myStake: account.balance.toBn(),
          isRoot: lsPool.ownerAddress === substrateAddress,
          isNominator: lsPool.nominatorAddress === substrateAddress,
          isBouncer: lsPool.bouncerAddress === substrateAddress,
          // TODO: Obtain which protocol this pool is associated with. For the parachain, there'd need to be some query to see what pools are associated with which parachain protocols. For Tangle networks, it's simply its own protocol. For now, using dummy data.
          lsProtocolId: LsProtocolId.TANGLE_LOCAL,
        } satisfies LsMyPoolRow;
      });
  }, [lsPools, substrateAddress]);

  const myStake = useMemo(() => {
    return myPools.reduce((acc, pool) => acc.add(pool.myStake), new BN(0));
  }, [myPools]);

  const rows = useMemo<LsMyProtocolRow[]>(() => {
    return lsNetwork.protocols.map(
      (lsProtocol) =>
        ({
          name: lsProtocol.name,
          // TODO: Reduce the TVL of the pools associated with this protocol.
          tvl: new BN(485348583485348),
          iconName: lsProtocol.token,
          myStake: myStake,
          pools: myPools,
          // TODO: Calculate the USD value of the TVL.
          tvlInUsd: undefined,
          token: lsProtocol.token,
          decimals: lsProtocol.decimals,
        }) satisfies LsMyProtocolRow,
    );
  }, [lsNetwork.protocols, myPools, myStake]);

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

export default LsMyProtocolsTable;
