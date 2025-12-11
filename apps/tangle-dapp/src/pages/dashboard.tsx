import { BN } from '@polkadot/util';
import { TokenIcon } from '@tangle-network/icons';
import Spinner from '@tangle-network/icons/Spinner';
import { useRestakingOverview } from '@tangle-network/tangle-shared-ui/data/restake/useRestakingData';
import HeaderCell from '@tangle-network/tangle-shared-ui/components/tables/HeaderCell';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  AmountFormatStyle,
  formatDisplayAmount,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
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
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Address } from 'viem';
import AccountSummaryCard from '../components/account/AccountSummaryCard';
import { ProtocolStatisticCard } from '../components/account/ProtocolStatisticCard';
import { UserRestakingOverview } from '../components/restaking/UserRestakingOverview';
import { NetworkGuard } from '../components/NetworkGuard';

// Table row data type
interface RestakeAssetRow {
  id: Address;
  symbol: string;
  name: string;
  decimals: number;
  available: BN;
  deposited: BN;
  delegated: BN;
  total: BN;
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
  COLUMN_HELPER.accessor('available', {
    header: () => <HeaderCell title="Available" />,
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
    header: () => <HeaderCell title="Deposited" />,
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
    header: () => <HeaderCell title="Delegated" />,
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
  COLUMN_HELPER.accessor('total', {
    header: () => <HeaderCell title="Total" />,
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

  // Calculate TVL data for ProtocolStatisticCard
  const tvlData = useMemo(() => {
    if (!restakingAssets) return null;
    return { totalDeposits: protocolTvl, assetCount };
  }, [restakingAssets, protocolTvl, assetCount]);

  // Build table data
  const tableData = useMemo<RestakeAssetRow[]>(() => {
    return assetList.map((asset) => {
      const position = delegatorInfo?.assetPositions.find(
        (p) => p.token.toLowerCase() === asset.id.toLowerCase(),
      );
      const available = new BN(asset.balance.toString());
      const deposited = new BN(
        (position?.totalDeposited ?? BigInt(0)).toString(),
      );
      const delegated = new BN(
        (position?.delegatedAmount ?? BigInt(0)).toString(),
      );
      const total = available.add(deposited);

      return {
        id: asset.id,
        symbol: asset.metadata.symbol,
        name: asset.metadata.name,
        decimals: asset.metadata.decimals,
        available,
        deposited,
        delegated,
        total,
      };
    });
  }, [assetList, delegatorInfo]);

  const columns = useMemo(() => getColumns(), []);

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
