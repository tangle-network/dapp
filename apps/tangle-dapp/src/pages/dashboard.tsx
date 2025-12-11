import { BN } from '@polkadot/util';
import { TokenIcon } from '@tangle-network/icons';
import {
  useRestakeAssets,
  useRestakingAssets,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDelegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import HeaderCell from '@tangle-network/tangle-shared-ui/components/tables/HeaderCell';
import {
  AmountFormatStyle,
  formatDisplayAmount,
  EMPTY_VALUE_PLACEHOLDER,
  Card,
} from '@tangle-network/ui-components';
import { Table } from '@tangle-network/ui-components/components/Table';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
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
      <div className="flex items-center gap-3">
        <TokenIcon name={props.row.original.symbol} size="lg" />

        <div>
          <Typography variant="body1" fw="bold" className="dark:text-mono-0">
            {props.row.original.symbol}
          </Typography>

          <Typography variant="body2" className="text-mono-100">
            {props.row.original.name}
          </Typography>
        </div>
      </div>
    ),
  }),
  COLUMN_HELPER.accessor('available', {
    header: () => <HeaderCell title="Available" />,
    cell: (props) => {
      const value = props.getValue();
      return formatDisplayAmount(
        value,
        props.row.original.decimals,
        AmountFormatStyle.SHORT,
      );
    },
  }),
  COLUMN_HELPER.accessor('deposited', {
    header: () => <HeaderCell title="Deposited" />,
    cell: (props) => {
      const value = props.getValue();
      return value.gtn(0)
        ? formatDisplayAmount(
            value,
            props.row.original.decimals,
            AmountFormatStyle.SHORT,
          )
        : EMPTY_VALUE_PLACEHOLDER;
    },
  }),
  COLUMN_HELPER.accessor('delegated', {
    header: () => <HeaderCell title="Delegated" />,
    cell: (props) => {
      const value = props.getValue();
      return value.gtn(0)
        ? formatDisplayAmount(
            value,
            props.row.original.decimals,
            AmountFormatStyle.SHORT,
          )
        : EMPTY_VALUE_PLACEHOLDER;
    },
  }),
  COLUMN_HELPER.accessor('total', {
    header: () => <HeaderCell title="Total" />,
    cell: (props) => {
      const value = props.getValue();
      return (
        <Typography variant="body1" fw="bold" className="dark:text-mono-0">
          {formatDisplayAmount(
            value,
            props.row.original.decimals,
            AmountFormatStyle.SHORT,
          )}
        </Typography>
      );
    },
  }),
];

const DashboardPage: FC = () => {
  const { address } = useAccount();

  // Fetch restaking assets (tokens that can be restaked)
  const { data: restakingAssets, isLoading: isLoadingRestakingAssets } =
    useRestakingAssets();

  // Fetch assets with user balances
  const {
    assets,
    assetList,
    isLoading: isLoadingAssets,
  } = useRestakeAssets();

  // Fetch delegator info for the connected user
  const { data: delegatorInfo, isLoading: isLoadingDelegator } =
    useDelegator(address);

  // Calculate TVL from restaking assets
  const tvlData = useMemo(() => {
    if (!restakingAssets) return null;
    const totalDeposits = restakingAssets.reduce(
      (sum, asset) => sum + asset.currentDeposits,
      BigInt(0),
    );
    return { totalDeposits, assetCount: restakingAssets.length };
  }, [restakingAssets]);

  const isLoading = isLoadingRestakingAssets || isLoadingAssets;

  // Build table data
  const tableData = useMemo<RestakeAssetRow[]>(() => {
    return assetList.map((asset) => {
      const position = delegatorInfo?.assetPositions.find(
        (p) => p.token.toLowerCase() === asset.id.toLowerCase(),
      );
      const available = new BN(asset.balance.toString());
      const deposited = new BN((position?.totalDeposited ?? BigInt(0)).toString());
      const delegated = new BN((position?.delegatedAmount ?? BigInt(0)).toString());
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

        <Card className="overflow-hidden">
          {isLoadingAssets ? (
            <div className="px-4 py-8 text-center text-mono-100">
              Loading assets...
            </div>
          ) : assetList.length === 0 ? (
            <div className="px-4 py-8 text-center text-mono-100">
              No restakable assets found
            </div>
          ) : (
            <Table
              variant={TableVariant.DEFAULT}
              tableProps={table}
              thClassName="first:pl-4"
              tdClassName="first:pl-4"
            />
          )}
        </Card>
      </div>
    </NetworkGuard>
  );
};

export default DashboardPage;
