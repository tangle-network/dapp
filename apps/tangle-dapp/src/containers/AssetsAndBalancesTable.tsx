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
import { PagePath, QueryParamKey } from '../types';
import { Link } from 'react-router';
import sortByLocaleCompare from '../utils/sortByLocaleCompare';
import useRestakeVaultAssets from '@webb-tools/tangle-shared-ui/data/restake/useRestakeVaultAssets';
import useIsAccountConnected from '../hooks/useIsAccountConnected';
import TableCellWrapper from '@webb-tools/tangle-shared-ui/components/tables/TableCellWrapper';
import LsTokenIcon from '@webb-tools/tangle-shared-ui/components/LsTokenIcon';
import formatPercentage from '@webb-tools/webb-ui-components/utils/formatPercentage';
import useRestakeBalances from '@webb-tools/tangle-shared-ui/data/restake/useRestakeBalances';
import useRestakeRewardConfig from '../data/restake/useRestakeRewardConfig';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import TableStatus from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import LstIcon from '../components/LiquidStaking/LstIcon';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { LstIconSize } from '../components/LiquidStaking/types';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import useRestakeAssetsTvl from '@webb-tools/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import sortByBn from '../utils/sortByBn';

type Row = {
  vaultId: number;
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
  apyPercentage?: number;
  depositCap?: BN;
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

            <Typography
              variant="body1"
              className="whitespace-nowrap dark:text-mono-100"
            >
              {props.getValue()}
            </Typography>
          </div>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('available', {
    header: () => 'Available',
    sortingFn: sortByBn((row) => row.available),
    cell: (props) => {
      const fmtAvailable = formatDisplayAmount(
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
          <StatItem title={fmtAvailable} subtitle={subtitle} removeBorder />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('locked', {
    header: () => 'Locked',
    sortingFn: sortByBn((row) => row.locked),
    cell: (props) => {
      const fmtLocked = formatDisplayAmount(
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
          <StatItem title={fmtLocked} subtitle={subtitle} removeBorder />
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('tvl', {
    sortingFn: sortByBn((row) => row.tvl),
    header: () => (
      <HeaderCell
        title="TVL & Cap"
        tooltip="Total value locked & deposit cap."
      />
    ),
    cell: (props) => {
      const tvl = props.getValue();

      const fmtTvl =
        tvl === undefined
          ? undefined
          : formatDisplayAmount(
              tvl,
              props.row.original.decimals,
              AmountFormatStyle.SI,
            );

      const depositCap = props.row.original.depositCap;

      const fmtDepositCap =
        depositCap === undefined
          ? '∞'
          : formatDisplayAmount(
              depositCap,
              props.row.original.decimals,
              AmountFormatStyle.SI,
            );

      return (
        <TableCellWrapper>
          <div className="flex items-center justify-center gap-1">
            <StatItem
              title={
                fmtTvl === undefined ? `${fmtDepositCap} Cap` : `${fmtTvl} TVL`
              }
              subtitle={
                fmtTvl === undefined ? undefined : `${fmtDepositCap} Cap`
              }
              removeBorder
            />
          </div>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('apyPercentage', {
    header: () => 'APY',
    cell: (props) => {
      const apyPercentage = props.getValue();

      if (apyPercentage === undefined) {
        return EMPTY_VALUE_PLACEHOLDER;
      }

      return (
        <TableCellWrapper removeRightBorder>
          {formatPercentage(apyPercentage)}
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
    cell: (props) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1">
          <Link
            to={`${PagePath.RESTAKE}/?${QueryParamKey.RESTAKE_VAULT}=${props.row.original.vaultId}`}
          >
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
    { id: 'tvl' satisfies keyof Row, desc: true },
  ]);

  const [columnVisibility, setColumnVisibility] = useState<
    VisibilityState & Partial<Record<keyof Row, boolean>>
  >({});

  const { balances } = useRestakeBalances();
  const rewardConfig = useRestakeRewardConfig();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const isAccountConnected = useIsAccountConnected();
  const { vaultAssets } = useRestakeVaultAssets();
  const assetsTvl = useRestakeAssetsTvl();

  const getTotalLockedInAsset = useCallback(
    (assetId: number) => {
      const deposit = delegatorInfo?.deposits[`${assetId}`];

      if (deposit === undefined) {
        return BN_ZERO;
      }

      const depositAmount = delegatorInfo?.deposits[`${assetId}`].amount;

      const delegation = delegatorInfo?.delegations.find((delegation) => {
        return delegation.assetId === assetId.toString();
      });

      const depositAmountBn =
        depositAmount === undefined
          ? BN_ZERO
          : new BN(depositAmount.toString());

      const delegationBn =
        delegation === undefined
          ? BN_ZERO
          : new BN(delegation.amountBonded.toString());

      return depositAmountBn.add(delegationBn);
    },
    [delegatorInfo?.delegations, delegatorInfo?.deposits],
  );

  const assetRows = useMemo<Row[]>(() => {
    return Object.entries(vaultAssets).flatMap(([assetId, metadata]) => {
      if (metadata.vaultId === null) {
        return [];
      }

      const config = rewardConfig?.get(metadata.vaultId);

      if (config === undefined) {
        return [];
      }

      // APY in this case is always between 0 and 100%.
      const apyPercentage = config.apy.toNumber() / 100;

      const depositCap =
        config.depositCap === undefined
          ? undefined
          : new BN(config.depositCap.toString());

      // TODO: Avoid using `as` to force cast here. This is a temporary workaround until the type of `assetId` is updated to be `RestakeAssetId`.
      const tvl =
        assetsTvl === null
          ? undefined
          : assetsTvl.get(assetId as RestakeAssetId);

      const assetBalances: (typeof balances)[string] | undefined =
        balances[assetId];

      const available =
        assetBalances?.balance !== undefined
          ? new BN(assetBalances.balance.toString())
          : BN_ZERO;

      return {
        vaultId: metadata.vaultId,
        name: metadata.name,
        tvl,
        available,
        locked: getTotalLockedInAsset(parseInt(assetId)),
        // TODO: This won't work because reward config is PER VAULT not PER ASSET. But isn't each asset its own vault?
        apyPercentage,
        tokenSymbol: metadata.symbol,
        decimals: metadata.decimals,
        depositCap,
      } satisfies Row;
    });
  }, [vaultAssets, assetsTvl, balances, getTotalLockedInAsset, rewardConfig]);

  // Combine all rows.
  const rows = useMemo<Row[]>(() => {
    return [...assetRows].sort((a, b) => {
      // Sort by available balance in descending order.
      return b.available.cmp(a.available);
    });
  }, [assetRows]);

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
        description="There are no restaking vaults or liquid staking pools available on this network yet. Please check back later."
      />
    );
  }

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      title={pluralize('asset', rows.length !== 1)}
      tableProps={table}
      trClassName="cursor-default"
      isPaginated
    />
  );
};

export default AssetsAndBalancesTable;
