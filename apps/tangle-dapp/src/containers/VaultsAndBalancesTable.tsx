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
  CircularProgress,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  InfoIconWithTooltip,
  isEvmAddress,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import Spinner from '@webb-tools/icons/Spinner';
import LsTokenIcon from '@webb-tools/tangle-shared-ui/components/LsTokenIcon';
import TableCellWrapper from '@webb-tools/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import useRestakeAssetsTvl from '@webb-tools/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useTangleEvmErc20Balances from '@webb-tools/tangle-shared-ui/hooks/useTangleEvmErc20Balances';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import assertRestakeAssetId from '@webb-tools/tangle-shared-ui/utils/assertRestakeAssetId';
import formatPercentage from '@webb-tools/webb-ui-components/utils/formatPercentage';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import get from 'lodash/get';
import { Link } from 'react-router';
import StatItem from '../components/StatItem';
import { HeaderCell } from '../components/tableCells';
import useRestakeRewardConfig from '../data/restake/useRestakeRewardConfig';
import useIsAccountConnected from '../hooks/useIsAccountConnected';
import { PagePath, QueryParamKey } from '../types';
import calculateBnRatio from '../utils/calculateBnRatio';
import sortByBn from '../utils/sortByBn';
import sortByLocaleCompare from '../utils/sortByLocaleCompare';

type Row = {
  vaultId: number;
  assetId: RestakeAssetId;
  name?: string;
  tokenSymbol: string;
  tvl?: BN;
  tvlInUsd?: number;
  available: BN;
  availableInUsd?: number;
  deposited: BN;
  depositedInUsd?: number;
  delegated: BN;
  delegatedInUsd?: number;
  points?: number;
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
            <LsTokenIcon name={props.row.original.tokenSymbol} size="lg" />

            {name !== undefined && (
              <Typography variant="h5" className="whitespace-nowrap">
                {name}
              </Typography>
            )}

            <Typography
              variant="body1"
              className="whitespace-nowrap text-mono-120 dark:text-mono-100"
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
  COLUMN_HELPER.accessor('deposited', {
    header: () => 'Deposits',
    sortingFn: sortByBn((row) => row.deposited),
    cell: (props) => {
      const fmtDeposited = formatDisplayAmount(
        props.row.original.deposited,
        props.row.original.decimals,
        AmountFormatStyle.SHORT,
      );

      const fmtDelegated = formatDisplayAmount(
        props.row.original.delegated,
        props.row.original.decimals,
        AmountFormatStyle.SHORT,
      );

      return (
        <TableCellWrapper>
          <Typography
            variant="body1"
            className="flex gap-1 items-center justify-center dark:text-mono-0"
          >
            {fmtDeposited}

            <InfoIconWithTooltip
              content={`${fmtDelegated}/${fmtDeposited} delegated`}
            />
          </Typography>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('tvl', {
    sortingFn: sortByBn((row) => row.tvl),
    header: () => (
      <HeaderCell
        title="TVL | Capacity"
        tooltip="Total value locked & deposit capacity."
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
              AmountFormatStyle.SHORT,
            );

      const depositCap = props.row.original.depositCap;

      const fmtDepositCap =
        depositCap === undefined
          ? '∞'
          : formatDisplayAmount(
              depositCap,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      const capacityPercentage =
        tvl === undefined || depositCap === undefined
          ? null
          : calculateBnRatio(tvl, depositCap);

      return (
        <TableCellWrapper>
          <div className="flex items-center justify-center gap-1">
            {capacityPercentage !== null && (
              <CircularProgress
                progress={capacityPercentage}
                size="md"
                tooltip={formatPercentage(capacityPercentage)}
              />
            )}

            <Typography variant="body1" className="dark:text-mono-0">
              {fmtTvl === undefined
                ? `${fmtDepositCap}`
                : `${fmtTvl} | ${fmtDepositCap}`}
            </Typography>
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
  COLUMN_HELPER.display({
    id: 'restake-action',
    header: () => null,
    enableSorting: false,
    cell: (props) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1">
          <Link
            to={`${PagePath.RESTAKE_DEPOSIT}?${QueryParamKey.RESTAKE_ASSET_ID}=${props.row.original.assetId}`}
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

const VaultsAndBalancesTable: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([
    // Default sorting by TVL in descending order.
    { id: 'tvl' satisfies keyof Row, desc: true },
  ]);

  const [columnVisibility, setColumnVisibility] = useState<
    VisibilityState & Partial<Record<keyof Row, boolean>>
  >({});

  const rewardConfig = useRestakeRewardConfig();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const isAccountConnected = useIsAccountConnected();

  const assetsTvl = useRestakeAssetsTvl();
  const { data: erc20Balances } = useTangleEvmErc20Balances();

  const {
    vaults,
    balances: customAssetBalances,
    isLoading,
  } = useRestakeContext();

  const getAssetTvl = useCallback(
    (assetId: RestakeAssetId) => {
      const deposits = delegatorInfo?.deposits ?? {};
      const deposit = get(deposits, assetId);

      if (deposit === undefined) {
        return BN_ZERO;
      }

      const depositAmount = deposit.amount;

      const depositAmountBn =
        depositAmount === undefined
          ? BN_ZERO
          : new BN(depositAmount.toString());

      return depositAmountBn;
    },
    [delegatorInfo?.deposits],
  );

  const vaultRows = useMemo<Row[]>(() => {
    return Object.entries(vaults).flatMap(([assetIdString, metadata]) => {
      if (metadata.vaultId === null) {
        return [];
      }

      const config = rewardConfig?.get(metadata.vaultId);

      if (config === undefined) {
        return [];
      }

      const assetId = assertRestakeAssetId(assetIdString);

      // APY in this case is always between 0 and 100%.
      const apyPercentage = config.apy.toNumber() / 100;

      const depositCap =
        config.depositCap === undefined
          ? undefined
          : new BN(config.depositCap.toString());

      const delegated =
        (assetsTvl === null ? undefined : assetsTvl.get(assetId)) ?? BN_ZERO;

      const assetBalances:
        | (typeof customAssetBalances)[RestakeAssetId]
        | undefined = customAssetBalances[assetId];

      const available = (() => {
        if (isEvmAddress(assetId)) {
          return (
            erc20Balances?.find((asset) => asset.contractAddress === assetId)
              ?.balance ?? BN_ZERO
          );
        } else {
          return assetBalances?.balance !== undefined
            ? new BN(assetBalances.balance.toString())
            : BN_ZERO;
        }
      })();

      const deposits = delegatorInfo?.deposits ?? {};
      const depositedBigInt = get(deposits, assetId)?.amount ?? BigInt(0);
      const deposited = new BN(depositedBigInt.toString());

      return {
        vaultId: metadata.vaultId,
        name: metadata.name,
        tvl: getAssetTvl(assetId),
        available,
        deposited,
        delegated,
        // TODO: This won't work because reward config is PER VAULT not PER ASSET. But isn't each asset its own vault?
        apyPercentage,
        tokenSymbol: metadata.symbol,
        decimals: metadata.decimals,
        depositCap,
        assetId,
      } satisfies Row;
    });
  }, [
    vaults,
    rewardConfig,
    assetsTvl,
    customAssetBalances,
    delegatorInfo?.deposits,
    getAssetTvl,
    erc20Balances,
  ]);

  // Combine all rows.
  const rows = useMemo<Row[]>(() => {
    return [...vaultRows].sort((a, b) => {
      // Sort by available balance in descending order.
      return b.available.cmp(a.available);
    });
  }, [vaultRows]);

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

  if (isLoading) {
    return (
      <TableStatus
        title="Loading..."
        description="Please wait while we load the data."
        icon={<Spinner size="lg" />}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <TableStatus
        title="No Assets Available Yet"
        description="There are no restaking vaults available on this network yet. Please check back later."
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

export default VaultsAndBalancesTable;
