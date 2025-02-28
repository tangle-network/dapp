import { useMemo, useState, type FC } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Button,
  EMPTY_VALUE_PLACEHOLDER,
  Typography,
} from '@tangle-network/ui-components';
import getTVLToDisplay from '@tangle-network/tangle-shared-ui/utils/getTVLToDisplay';
import { TableStatusProps } from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '@tangle-network/tangle-shared-ui/components/tables/TangleCloudTable';
import { TvlItem } from './type';
import { BN } from '@polkadot/util';

const columnHelper = createColumnHelper<TvlItem>();

const MOCK_TVL_ITEMS: TvlItem[] = [
  {
    tokenSymbol: 'TANGLE',
    tokenName: 'TANGLE',
    tokenImg: 'https://dummyimage.com/100x100',
    apy: 10,
    tvl: new BN(1000000),
    tvlInUSD: 1000000,
    liquidity: new BN(1000000),
    liquidityInUSD: 1000000,
  },
  {
    tokenSymbol: 'DOT',
    tokenName: 'Polkadot',
    tokenImg: 'https://dummyimage.com/100x100',
    apy: 10,
    tvl: new BN(1000000),
    tvlInUSD: 1000000,
    liquidity: new BN(1000000),
    liquidityInUSD: 1000000,
  },
];

export const TvlTable: FC = () => {
  const [tvlItems, setTvlItems] =
    useState<TvlItem[]>(MOCK_TVL_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingTableProps: Partial<TableStatusProps> = {};
  const emptyTableProps: Partial<TableStatusProps> = {};

  const isEmpty = tvlItems.length === 0;

  /**
   * `h-12` is followed the `lg` size of `Avatar` component
   * to make the table cells have the same height
   */
  const commonCellClassName = 'h-12 flex items-center';
  const columns = useMemo(
    () => [
      columnHelper.accessor('tokenName', {
        header: () => 'Vault',
        cell: (props) => {
          return (
            <div className="flex items-center gap-2">
              {props.row.original.tokenImg ? (
                <Avatar
                  size="lg"
                  className="min-w-12"
                  src={props.row.original.tokenImg}
                  alt={props.row.original.tokenName}
                  sourceVariant="uri"
                />
              ) : (
                <Avatar
                  size="lg"
                  className="min-w-12"
                  fallback={props.row.original.tokenSymbol.substring(0, 2)}
                  theme="substrate"
                />
              )}
              <Typography
                variant="body1"
                fw="bold"
                className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
              >
                {props.row.original.tokenName}
              </Typography>
            </div>
          );
        },
      }),
      columnHelper.accessor('apy', {
        header: () => 'APY',
        cell: (props) => {
          return (
            <div className={commonCellClassName}>
              {props.row.original.apy
                ? `${props.row.original.apy.toLocaleString()}%`
                : EMPTY_VALUE_PLACEHOLDER}
            </div>
          );
        },
      }),
      columnHelper.accessor('tvlInUSD', {
        header: () => 'TVL',
        cell: (props) => {
          return (
            <div className={commonCellClassName}>
              {props.row.original.tvlInUSD
                ? getTVLToDisplay(props.row.original.tvlInUSD)
                : EMPTY_VALUE_PLACEHOLDER}
            </div>
          );
        },
      }),
      columnHelper.accessor('liquidityInUSD', {
        header: () => 'Liquidity',
        cell: (props) => {
          return (
            <div className={commonCellClassName}>
              {props.row.original.liquidityInUSD
                ? getTVLToDisplay(props.row.original.liquidityInUSD)
                : EMPTY_VALUE_PLACEHOLDER}
            </div>
          );
        },
      }),
      columnHelper.accessor('tokenSymbol', {
        header: () => '',
        cell: (props) => {
          return (
            <div className={commonCellClassName}>
            <Button
              variant="link"
              size="sm"
              className="w-full uppercase"
              onClick={() => {
                console.log('restake');
              }}
            >
              restake
            </Button>
          </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: tvlItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.tokenSymbol,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<TvlItem>
      title={pluralize('blueprint', !isEmpty)}
      data={tvlItems}
      error={error}
      isLoading={isLoading}
      loadingTableProps={loadingTableProps}
      emptyTableProps={emptyTableProps}
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
      }}
    />
  );
};

TvlTable.displayName = 'TvlTable';
