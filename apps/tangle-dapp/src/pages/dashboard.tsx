import { BN } from '@polkadot/util';
import { TokenIcon } from '@tangle-network/icons';
import Spinner from '@tangle-network/icons/Spinner';
import { useRestakingOverview } from '@tangle-network/tangle-shared-ui/data/restake/useRestakingData';
import type { RestakingAsset } from '@tangle-network/tangle-shared-ui/data/graphql/useRestakingAssets';
import HeaderCell from '@tangle-network/tangle-shared-ui/components/tables/HeaderCell';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  AmountFormatStyle,
  formatDisplayAmount,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Table } from '@tangle-network/ui-components/components/Table';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router';
import { Address, formatUnits } from 'viem';
import AccountSummaryCard from '../components/account/AccountSummaryCard';
import { ProtocolStatisticCard } from '../components/account/ProtocolStatisticCard';
import { UserRestakingOverview } from '../components/restaking/UserRestakingOverview';
import { NetworkGuard } from '../components/NetworkGuard';
import TntBreakdownCard from '../components/account/TntBreakdownCard';
import useUserRestakingStats from '../data/restaking/useUserRestakingStats';
import { PagePath } from '../types';

// Table row data type
interface RestakeAssetRow {
  id: Address;
  symbol: string;
  name: string;
  decimals: number;
  wallet: BN;
  deposited: BN;
  delegated: BN;
  protocolTvl: BN;
}

const COLUMN_HELPER = createColumnHelper<RestakeAssetRow>();

const getColumns = () => [
  COLUMN_HELPER.accessor('id', {
    header: () => <HeaderCell title="Asset" />,
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10">
            <TokenIcon name={props.row.original.symbol} size="xl" />
          </div>

          <div>
            <Typography variant="h5" className="whitespace-nowrap">
              {props.row.original.symbol}
            </Typography>

            <Typography
              variant="body3"
              className="text-mono-120 dark:text-mono-100"
            >
              {props.row.original.name}
            </Typography>
          </div>
        </div>
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('wallet', {
    header: () => <HeaderCell title="Wallet" />,
    cell: (props) => {
      const value = props.getValue();
      return (
        <TableCellWrapper>
          {formatDisplayAmount(
            value,
            props.row.original.decimals,
            AmountFormatStyle.SHORT,
          )}
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('deposited', {
    header: () => <HeaderCell title="Your Deposited" />,
    cell: (props) => {
      const value = props.getValue();
      return (
        <TableCellWrapper>
          {value.gtn(0)
            ? formatDisplayAmount(
                value,
                props.row.original.decimals,
                AmountFormatStyle.SHORT,
              )
            : EMPTY_VALUE_PLACEHOLDER}
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('delegated', {
    header: () => <HeaderCell title="Your Delegated" />,
    cell: (props) => {
      const value = props.getValue();
      return (
        <TableCellWrapper>
          {value.gtn(0)
            ? formatDisplayAmount(
                value,
                props.row.original.decimals,
                AmountFormatStyle.SHORT,
              )
            : EMPTY_VALUE_PLACEHOLDER}
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('protocolTvl', {
    header: () => <HeaderCell title="TVL" />,
    cell: (props) => {
      const value = props.getValue();
      return (
        <TableCellWrapper removeRightBorder>
          {formatDisplayAmount(
            value,
            props.row.original.decimals,
            AmountFormatStyle.SHORT,
          )}
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex justify-center">
          <Link to={`${PagePath.RESTAKE_DEPOSIT}?asset=${row.original.id}`}>
            <Button size="sm">Deposit</Button>
          </Link>
        </div>
      </TableCellWrapper>
    ),
  }),
];

const DashboardPage: FC = () => {
  // Use the unified restaking data hook
  const {
    assets,
    assetList,
    restakingAssets,
    delegator: delegatorInfo,
    isLoading,
    isLoadingAssets,
    isLoadingDelegator,
    protocolTvl,
    assetCount,
  } = useRestakingOverview();
  const { data: restakingStats, isLoading: isRestakingStatsLoading } =
    useUserRestakingStats();

  // Calculate TVL data for ProtocolStatisticCard
  const tvlData = useMemo(() => {
    if (!restakingAssets) return null;
    return { totalDeposits: protocolTvl, assetCount };
  }, [restakingAssets, protocolTvl, assetCount]);

  // Build table data
  const protocolAssetMap = useMemo(() => {
    const map = new Map<string, RestakingAsset>();
    restakingAssets?.forEach((asset) => {
      map.set(asset.token.toLowerCase(), asset);
    });
    return map;
  }, [restakingAssets]);

  const tableData = useMemo<RestakeAssetRow[]>(() => {
    return assetList.map((asset) => {
      const tokenKey = asset.id.toLowerCase();
      const position = delegatorInfo?.assetPositions.find(
        (p) => p.token.toLowerCase() === tokenKey,
      );
      const protocolAsset = protocolAssetMap.get(tokenKey);
      const wallet = new BN(asset.balance.toString());
      const deposited = new BN(
        (position?.totalDeposited ?? BigInt(0)).toString(),
      );
      const delegated = new BN(
        (position?.delegatedAmount ?? BigInt(0)).toString(),
      );
      const protocolTvl = new BN(
        (protocolAsset?.currentDeposits ?? BigInt(0)).toString(),
      );

      return {
        id: asset.id,
        symbol: asset.metadata.symbol,
        name: asset.metadata.name,
        decimals: asset.metadata.decimals,
        wallet,
        deposited,
        delegated,
        protocolTvl,
      };
    });
  }, [assetList, delegatorInfo, protocolAssetMap]);

  const columns = useMemo(() => getColumns(), []);

  const tntAsset = useMemo(() => {
    const endsWithTnt = (symbol: string) =>
      symbol.toLowerCase().endsWith('tnt');

    return (
      assetList.find((asset) => endsWithTnt(asset.metadata.symbol)) ?? null
    );
  }, [assetList]);

  const tntPosition = useMemo(() => {
    if (!delegatorInfo || !tntAsset) {
      return null;
    }
    const tokenKey = tntAsset.id.toLowerCase();
    return (
      delegatorInfo.assetPositions.find(
        (pos) => pos.token.toLowerCase() === tokenKey,
      ) ?? null
    );
  }, [delegatorInfo, tntAsset]);

  const walletTnt = tntAsset?.balance ?? BigInt(0);
  const restakedTnt = tntPosition?.totalDeposited ?? BigInt(0);
  const delegatedTnt = tntPosition?.delegatedAmount ?? BigInt(0);
  const availableRestaked =
    restakedTnt > delegatedTnt ? restakedTnt - delegatedTnt : BigInt(0);
  const tntRewards = restakingStats?.pendingRewards ?? BigInt(0);
  const tntDecimals = tntAsset?.metadata.decimals ?? 18;
  const tntSymbol = tntAsset?.metadata.symbol ?? 'TNT';

  const formatTokenAmount = useCallback((value: bigint, decimals?: number) => {
    if (decimals === undefined) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    const formatted = formatUnits(value, decimals);
    const num = Number.parseFloat(formatted);
    if (!Number.isFinite(num)) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    if (num === 0) return '0';
    if (Math.abs(num) < 0.0001 && num > 0) return '< 0.0001';
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    });
  }, []);

  const tntBreakdown = useMemo(
    () => ({
      wallet: formatTokenAmount(walletTnt, tntDecimals),
      restaked: formatTokenAmount(restakedTnt, tntDecimals),
      delegated: formatTokenAmount(delegatedTnt, tntDecimals),
      available: formatTokenAmount(availableRestaked, tntDecimals),
      rewards: formatTokenAmount(tntRewards, tntDecimals),
    }),
    [
      walletTnt,
      restakedTnt,
      delegatedTnt,
      availableRestaked,
      tntRewards,
      tntDecimals,
      formatTokenAmount,
    ],
  );

  const isTntBreakdownLoading =
    isLoadingAssets || isLoadingDelegator || isRestakingStatsLoading;

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <NetworkGuard>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AccountSummaryCard className="md:max-w-none" />

          <ProtocolStatisticCard
            isLoading={isLoading}
            restakingAssets={restakingAssets ?? []}
            tvlData={tvlData}
          />
        </div>

        <TntBreakdownCard
          symbol={tntSymbol}
          walletValue={tntBreakdown.wallet}
          restakedValue={tntBreakdown.restaked}
          delegatedValue={tntBreakdown.delegated}
          availableValue={tntBreakdown.available}
          rewardsValue={tntBreakdown.rewards}
          isLoading={isTntBreakdownLoading}
        />

        <Typography variant="h4" fw="bold">
          Your Position
        </Typography>

        <UserRestakingOverview
          delegator={delegatorInfo ?? null}
          assets={assets}
          isLoading={isLoadingDelegator || isLoadingAssets}
        />

        <Typography variant="h4" fw="bold">
          Restake Assets
        </Typography>

        {isLoadingAssets ? (
          <TableStatus
            title="Loading Assets"
            description="Please wait while we load the restakable assets."
            icon={<Spinner size="lg" />}
          />
        ) : assetList.length === 0 ? (
          <TableStatus
            title="No Assets Found"
            description="It looks like there are no restakable assets at the moment."
          />
        ) : (
          <Table
            variant={TableVariant.GLASS_OUTER}
            title={pluralize('asset', tableData.length !== 1)}
            isPaginated
            tableProps={table}
            className="px-2"
            tableWrapperClassName="py-2"
            tableClassName="border-collapse border-spacing-0"
            thClassName="py-2"
            tbodyClassName={twMerge(
              '[&_tr:first-child_td:first-child]:rounded-tl-xl [&_tr:first-child_td:last-child]:rounded-tr-xl',
              '[&_tr:last-child_td:first-child]:rounded-bl-xl [&_tr:last-child_td:last-child]:rounded-br-xl',
            )}
            trClassName="last:border-b-0"
            tdClassName="first:rounded-l-none last:rounded-r-none"
          />
        )}
      </div>
    </NetworkGuard>
  );
};

export default DashboardPage;
