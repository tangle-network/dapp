import { FC, useMemo } from 'react';
import { BN } from '@polkadot/util';
import { TokenIcon } from '@tangle-network/icons';
import Spinner from '@tangle-network/icons/Spinner';
import { useChainId } from 'wagmi';
import HeaderCell from '@tangle-network/tangle-shared-ui/components/tables/HeaderCell';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  Avatar,
  AmountFormatStyle,
  CopyWithTooltip,
  formatDisplayAmount,
  EMPTY_VALUE_PLACEHOLDER,
  shortenHex,
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
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import { PagePath, QueryParamKey } from '../../types';

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
const TABLE_ACTION_BUTTON_CLASS =
  'uppercase body4 font-semibold transition-all duration-200 bg-purple-10 dark:bg-purple-120 text-purple-70 dark:text-purple-40 hover:bg-purple-20 dark:hover:bg-purple-110 border border-purple-30 dark:border-purple-100';

const isFallbackSymbol = (symbol: string) =>
  symbol.startsWith('0x') || symbol.includes('...');

const resolveTokenIconSymbol = (
  chainId: number,
  symbol: string,
  address: Address,
) => {
  const cached = getCachedTokenMetadata(chainId, address);
  const candidate = cached?.symbol ?? symbol;
  return isFallbackSymbol(candidate) ? null : candidate;
};

const getColumns = (chainId: number) => [
  COLUMN_HELPER.accessor('id', {
    header: () => <HeaderCell title="Asset" />,
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10">
            {(() => {
              const iconSymbol = resolveTokenIconSymbol(
                chainId,
                props.row.original.symbol,
                props.row.original.tokenAddress,
              );

              if (iconSymbol) {
                return <TokenIcon name={iconSymbol} size="xl" />;
              }

              return (
                <Avatar
                  size="lg"
                  value={props.row.original.tokenAddress}
                  theme="ethereum"
                />
              );
            })()}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Typography variant="h5" className="whitespace-nowrap">
                {props.row.original.symbol}
              </Typography>

              <Typography
                variant="body3"
                className="text-mono-120 dark:text-mono-100 truncate"
              >
                {props.row.original.name}
              </Typography>
            </div>

            <div className="flex items-center gap-2 text-mono-120 dark:text-mono-100">
              <Typography variant="body4" className="font-mono">
                {shortenHex(props.row.original.tokenAddress)}
              </Typography>
              <CopyWithTooltip
                textToCopy={props.row.original.tokenAddress}
                isButton={false}
                copyLabel="Copy address"
              />
            </div>
          </div>
        </div>
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('wallet', {
    header: () => <HeaderCell title="Wallet" />,
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
      <TableCellWrapper removeRightBorder className="p-3 justify-center">
        <Link
          to={`${PagePath.RESTAKE_DEPOSIT}?${QueryParamKey.RESTAKE_ASSET_ID}=${row.original.tokenAddress}`}
        >
          <Button
            size="sm"
            variant="utility"
            className={TABLE_ACTION_BUTTON_CLASS}
          >
            Deposit
          </Button>
        </Link>
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
  const chainId = useChainId();

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

      const walletBalance = asset.balance ?? BigInt(0);
      const wallet = new BN(walletBalance.toString());
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
          columns: getColumns(chainId),
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<RestakeAssetRow>,
      [tableData, chainId],
    ),
  );

  if (isLoading && tableData.length === 0) {
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
      className="border border-mono-40/50 dark:border-mono-170/50 bg-transparent"
    />
  );
};

export default RestakingAssetsTable;
