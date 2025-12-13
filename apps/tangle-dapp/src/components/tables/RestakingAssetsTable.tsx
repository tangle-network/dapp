import { FC, useMemo } from 'react';
import { BN } from '@polkadot/util';
import { TokenIcon } from '@tangle-network/icons';
import Spinner from '@tangle-network/icons/Spinner';
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
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { Address } from 'viem';
import { Link } from 'react-router';
import type { RestakeAsset } from '@tangle-network/tangle-shared-ui/data/graphql/useRestakeAssets';
import type { RestakingAsset } from '@tangle-network/tangle-shared-ui/data/graphql/useRestakingAssets';
import type { Delegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import { PagePath } from '../../types';

interface Props {
  assets: RestakeAsset[];
  restakingAssets: RestakingAsset[];
  delegator: Delegator | null;
  isLoading: boolean;
}

interface RestakeAssetRow {
  id: Address;
  symbol: string;
  name: string;
  decimals: number;
  wallet: BN;
  deposited: BN;
  delegated: BN;
  protocolTvl: BN;
  tokenAddress: Address;
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
    cell: (props) => (
      <TableCellWrapper>
        {formatDisplayAmount(
          props.getValue(),
          props.row.original.decimals,
          AmountFormatStyle.SHORT,
        )}
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('deposited', {
    header: () => <HeaderCell title="Your Deposited" />,
    cell: (props) => (
      <TableCellWrapper>
        {props.getValue().gtn(0)
          ? formatDisplayAmount(
              props.getValue(),
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            )
          : EMPTY_VALUE_PLACEHOLDER}
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('delegated', {
    header: () => <HeaderCell title="Your Delegated" />,
    cell: (props) => (
      <TableCellWrapper>
        {props.getValue().gtn(0)
          ? formatDisplayAmount(
              props.getValue(),
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            )
          : EMPTY_VALUE_PLACEHOLDER}
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('protocolTvl', {
    header: () => <HeaderCell title="TVL" />,
    cell: (props) => (
      <TableCellWrapper>
        {formatDisplayAmount(
          props.getValue(),
          props.row.original.decimals,
          AmountFormatStyle.SHORT,
        )}
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex justify-center">
          <Link
            to={`${PagePath.RESTAKE_DEPOSIT}?asset=${row.original.tokenAddress}`}
          >
            <Button size="sm">Deposit</Button>
          </Link>
        </div>
      </TableCellWrapper>
    ),
  }),
];

export const RestakingAssetsTable: FC<Props> = ({
  assets,
  restakingAssets,
  delegator,
  isLoading,
}) => {
  const protocolAssetMap = useMemo(() => {
    const map = new Map<string, RestakingAsset>();
    restakingAssets?.forEach((asset) => {
      map.set(asset.token.toLowerCase(), asset);
    });
    return map;
  }, [restakingAssets]);

  const tableData = useMemo<RestakeAssetRow[]>(() => {
    return assets.map((asset) => {
      const tokenKey = asset.id.toLowerCase();
      const position = delegator?.assetPositions.find(
        (p) => p.token.toLowerCase() === tokenKey,
      );
      const protocolAsset = protocolAssetMap.get(tokenKey);

      const wallet = new BN((asset.balance ?? BigInt(0)).toString());
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
        tokenAddress: asset.id,
      };
    });
  }, [assets, delegator, protocolAssetMap]);

  const table = useReactTable(
    useMemo(
      () =>
        ({
          data: tableData,
          columns: getColumns(),
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<RestakeAssetRow>,
      [tableData],
    ),
  );

  if (isLoading) {
    return (
      <TableStatus
        title="Loading Restake Assets"
        description="Fetching available restake assets…"
        icon={<Spinner size="lg" />}
      />
    );
  }

  if (tableData.length === 0) {
    return (
      <TableStatus
        title="No Restake Assets"
        description="No restaking assets are configured for this network."
      />
    );
  }

  return (
    <Table
      tableProps={table}
      variant={TableVariant.GLASS_OUTER}
      isPaginated={false}
      className="border border-mono-40/50 dark:border-mono-170/50 bg-transparent"
    />
  );
};

export default RestakingAssetsTable;
