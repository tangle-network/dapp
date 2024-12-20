'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  AmountFormatStyle,
  Button,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import StatItem from '../components/StatItem';
import { HeaderCell } from '../components/tableCells';
import { ArrowRight } from '@webb-tools/icons';
import { PagePath } from '../types';
import { Link } from 'react-router';
import sortByLocaleCompare from '../utils/sortByLocaleCompare';
import { twMerge } from 'tailwind-merge';
import useRestakeAssetMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeAssetMap';
import useIsAccountConnected from '../hooks/useIsAccountConnected';
import useLsPools from '../data/liquidStaking/useLsPools';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import TableCellWrapper from '@webb-tools/tangle-shared-ui/components/tables/TableCellWrapper';
import LsTokenIcon from '@webb-tools/tangle-shared-ui/components/LsTokenIcon';
import formatFractional from '@webb-tools/webb-ui-components/utils/formatFractional';
import useRestakeBalances from '@webb-tools/tangle-shared-ui/data/restake/useRestakeBalances';
import useRestakeRewardConfig from '../data/restake/useRestakeRewardConfig';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import TableStatus from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import LstIcon from '../components/LiquidStaking/LstIcon';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { LstIconSize } from '../components/LiquidStaking/types';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';

enum RowType {
  ASSET,
  LS_POOL,
}

type Row = {
  type: RowType;
  name?: string;
  tokenSymbol: string;
  tvl?: BN;
  tvlInUsd?: number;
  available: BN;
  availableInUsd?: number;
  locked: BN;
  lockedInUsd?: number;
  points?: number;
  iconUrl?: string;
  decimals: number;
  apyFractional?: number;
  cap?: BN;
};

const COLUMN_HELPER = createColumnHelper<Row>();

const COLUMNS = [
  COLUMN_HELPER.accessor('tokenSymbol', {
    header: () => 'Asset',
    sortDescFirst: true,
    sortingFn: sortByLocaleCompare((row) => row.name ?? row.tokenSymbol),
    cell: (props) => {
      const name = props.row.original.name;

      return (
        <TableCellWrapper className="pl-3">
          <div className="flex items-center gap-2">
            {props.row.original.iconUrl !== undefined ? (
              <LstIcon
                lsProtocolId={LsProtocolId.TANGLE_MAINNET}
                iconUrl={props.row.original.iconUrl}
                size={LstIconSize.LG}
              />
            ) : (
              <LsTokenIcon name="tnt" size="lg" />
            )}

            {name !== undefined && (
              <Typography variant="h5" className="whitespace-nowrap">
                {name}
              </Typography>
            )}

            {props.row.original.type !== RowType.LS_POOL && (
              <Typography
                variant="body1"
                className="whitespace-nowrap dark:text-mono-100"
              >
                {props.getValue()}
              </Typography>
            )}
          </div>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('available', {
    header: () => 'Available',
    sortingFn: (rowA, rowB) =>
      rowB.original.available.cmp(rowA.original.available),
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
            title={`${formattedMyStake} ${props.row.original.tokenSymbol}`}
            subtitle={subtitle}
            removeBorder
          />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('locked', {
    header: () => 'Locked',
    sortingFn: (rowA, rowB) => rowB.original.locked.cmp(rowA.original.locked),
    cell: (props) => {
      const formattedMyStake = formatDisplayAmount(
        props.getValue(),
        props.row.original.decimals,
        AmountFormatStyle.SHORT,
      );

      const subtitle =
        props.row.original.lockedInUsd === undefined
          ? undefined
          : `$${props.row.original.lockedInUsd}`;

      return (
        <TableCellWrapper>
          <StatItem
            title={`${formattedMyStake} ${props.row.original.tokenSymbol}`}
            subtitle={subtitle}
            removeBorder
          />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('tvl', {
    sortingFn: (rowA, rowB) => {
      if (rowA.original.tvl === undefined || rowB.original.tvl === undefined) {
        return 0;
      }

      return rowB.original.tvl.cmp(rowA.original.tvl);
    },
    header: () => (
      <HeaderCell
        title="TVL & CAP"
        tooltip="Total value locked & market cap."
      />
    ),
    cell: (props) => {
      const tvl = props.getValue();

      if (tvl === undefined) {
        return EMPTY_VALUE_PLACEHOLDER;
      }

      const formattedTvl = formatDisplayAmount(
        tvl,
        props.row.original.decimals,
        AmountFormatStyle.SI,
      );

      const cap = props.row.original.cap;

      const formattedCap =
        cap === undefined
          ? undefined
          : formatDisplayAmount(
              cap,
              props.row.original.decimals,
              AmountFormatStyle.SI,
            );

      return (
        <TableCellWrapper>
          <StatItem
            title={`${formattedTvl} TVL`}
            subtitle={
              formattedCap === undefined ? undefined : `${formattedCap} CAP`
            }
            removeBorder
          />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('apyFractional', {
    header: () => (
      <HeaderCell
        title="APY"
        tooltip="Calculated based on recent performance and may vary over time. Newer assets with limited history may display inaccurate APY estimates."
      />
    ),
    cell: (props) => {
      const apyFractional = props.getValue();

      if (apyFractional === undefined) {
        return EMPTY_VALUE_PLACEHOLDER;
      }

      const isGain = apyFractional >= 0;

      // Negative values already include the negative sign.
      const polarity = isGain ? '+' : '';

      return (
        <TableCellWrapper removeRightBorder>
          <span
            className={twMerge(
              isGain ? 'dark:text-green-400' : 'dark:text-red-400',
            )}
          >
            {polarity}
            {formatFractional(apyFractional)}
          </span>
        </TableCellWrapper>
      );
    },
  }),
  // TODO: Hiding for now. See #2708.
  // COLUMN_HELPER.accessor('points', {
  //   header: () => (
  //     <HeaderCell
  //       title="Points"
  //       tooltip="Points are relevant for the upcoming airdrop campaign."
  //     />
  //   ),
  //   cell: (props) => {
  //     const points = props.getValue();

  //     if (points === undefined) {
  //       return EMPTY_VALUE_PLACEHOLDER;
  //     }

  //     return (
  //       <TableCellWrapper>
  //         <Typography variant="h5">{addCommasToNumber(points)}</Typography>
  //       </TableCellWrapper>
  //     );
  //   },
  // }),
  COLUMN_HELPER.display({
    id: 'restake-action',
    header: () => null,
    enableSorting: false,
    cell: () => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1">
          {/** TODO: Include asset ID in the URL. */}
          <Link to={PagePath.RESTAKE_DEPOSIT}>
            <Button
              variant="utility"
              size="sm"
              rightIcon={
                <ArrowRight className="fill-current dark:fill-current" />
              }
            >
              Restake
            </Button>
          </Link>
        </div>
      </TableCellWrapper>
    ),
  }),
];

const AssetsAndBalancesTable: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([
    // Default sorting by TVL in descending order.
    { id: 'tvl' satisfies keyof Row, desc: false },
  ]);

  const [columnVisibility, setColumnVisibility] = useState<
    VisibilityState & Partial<Record<keyof Row, boolean>>
  >({});

  const { balances } = useRestakeBalances();
  const { assetMap } = useRestakeAssetMap();
  const { rewardConfig } = useRestakeRewardConfig();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const allPools = useLsPools();
  const isAccountConnected = useIsAccountConnected();
  const nativeTokenSymbol = useNetworkStore((state) => state.nativeTokenSymbol);
  const substrateAddress = useSubstrateAddress();
  const assets = useRestakeAssetMap();

  const getTotalLockedInAsset = useCallback(
    (assetId: number) => {
      const deposited = delegatorInfo?.deposits[assetId].amount;

      const delegated = delegatorInfo?.delegations.find((delegation) => {
        return delegation.assetId === assetId.toString();
      });

      const depositedBn =
        deposited === undefined ? BN_ZERO : new BN(deposited.toString());

      const delegatedBn =
        delegated === undefined
          ? BN_ZERO
          : new BN(delegated.amountBonded.toString());

      return depositedBn.add(delegatedBn);
    },
    [delegatorInfo?.delegations, delegatorInfo?.deposits],
  );

  const assetRows = useMemo<Row[]>(() => {
    return Object.entries(assets.assetMap).flatMap(([assetId, metadata]) => {
      const cap = rewardConfig.configs[assetId]?.cap;
      const capBn = cap === undefined ? undefined : new BN(cap.toString());
      const tvl = metadata.details?.supply.toBn();

      const assetBalances: (typeof balances)[string] | undefined =
        balances[assetId];

      const available =
        assetBalances?.balance !== undefined
          ? new BN(assetBalances.balance.toString())
          : BN_ZERO;

      return {
        type: RowType.ASSET,
        name: metadata.name,
        tvl,
        available,
        locked: getTotalLockedInAsset(parseInt(assetId)),
        // TODO: This won't work because reward config is PER VAULT not PER ASSET. But isn't each asset its own vault?
        apyFractional: rewardConfig.configs[assetId]?.apy,
        // TODO: Each asset should have its own token symbol.
        tokenSymbol: nativeTokenSymbol,
        decimals: metadata.decimals,
        cap: capBn,
      } satisfies Row;
    });
  }, [
    assets.assetMap,
    balances,
    getTotalLockedInAsset,
    nativeTokenSymbol,
    rewardConfig.configs,
  ]);

  const lsPoolRows = useMemo<Row[]>(() => {
    if (!(allPools instanceof Map)) {
      return [];
    }

    const pools = Array.from(allPools.values());

    return pools.map((pool) => {
      const name = `${pool.name ?? 'Pool'}#${pool.id}`.toUpperCase();

      const membership =
        substrateAddress === null
          ? undefined
          : pool.members.get(substrateAddress);

      const myStake = membership?.balance.toBn() ?? BN_ZERO;

      return {
        type: RowType.LS_POOL,
        name,
        tokenSymbol: name,
        tvl: pool.totalStaked,
        available: myStake,
        locked: getTotalLockedInAsset(pool.id),
        iconUrl: pool.iconUrl,
        decimals: TANGLE_TOKEN_DECIMALS,
        apyFractional: pool.apyPercentage,
      } satisfies Row;
    });
  }, [allPools, getTotalLockedInAsset, substrateAddress]);

  // All rows combined.
  const rows = useMemo<Row[]>(() => {
    // Sort by highest available balance (descending).
    return [...assetRows, ...lsPoolRows].sort((a, b) => {
      return b.available.cmp(a.available);
    });
  }, [assetRows, lsPoolRows]);

  const table = useReactTable({
    data: rows,
    columns: COLUMNS,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  // Show or hide the "Available" and "Locked" columns based on whether
  // there is an account connected.
  useEffect(() => {
    setColumnVisibility({
      available: isAccountConnected,
      locked: isAccountConnected,
    });
  }, [isAccountConnected]);

  if (rows.length === 0) {
    return (
      <TableStatus
        title="No Assets"
        description="There are no assets available yet. Get started by creating your own asset or liquid staking pool!"
      />
    );
  }

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      tableProps={table}
      trClassName="cursor-default"
    />
  );
};

export default AssetsAndBalancesTable;
