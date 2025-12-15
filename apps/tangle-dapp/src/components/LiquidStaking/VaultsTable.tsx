import { FC, useMemo } from 'react';
import { formatUnits, Address } from 'viem';
import { Link } from 'react-router';
import Spinner from '@tangle-network/icons/Spinner';
import HeaderCell from '@tangle-network/tangle-shared-ui/components/tables/HeaderCell';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  useLiquidDelegationVaults,
  type LiquidDelegationVault,
} from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import { useRestakeAssets } from '@tangle-network/tangle-shared-ui/data/graphql';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Table } from '@tangle-network/ui-components/components/Table';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../../types';

type VaultWithAssetInfo = LiquidDelegationVault & {
  assetSymbol: string;
  assetDecimals: number;
};

const COLUMN_HELPER = createColumnHelper<VaultWithAssetInfo>();

const shortenAddress = (address: Address) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const COLUMNS = [
  COLUMN_HELPER.accessor('operator', {
    header: () => <HeaderCell title="Operator" />,
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex flex-col">
          <Typography variant="body1" className="font-medium">
            {shortenAddress(props.getValue())}
          </Typography>
          <Typography variant="body3" className="text-mono-100">
            {props.row.original.selectionMode === 0
              ? 'All Blueprints'
              : `${props.row.original.blueprintIds.length} Blueprint${props.row.original.blueprintIds.length !== 1 ? 's' : ''}`}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('asset', {
    header: () => <HeaderCell title="Asset" />,
    cell: (props) => (
      <TableCellWrapper>
        <Typography variant="body1">
          {props.row.original.assetSymbol}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('totalAssets', {
    header: () => (
      <HeaderCell title="TVL" tooltip="Total Value Locked in the vault" />
    ),
    cell: (props) => {
      const formatted = formatUnits(
        props.getValue(),
        props.row.original.assetDecimals,
      );
      return (
        <TableCellWrapper>
          <Typography variant="body1">
            {Number(formatted).toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}{' '}
            {props.row.original.assetSymbol}
          </Typography>
        </TableCellWrapper>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.totalAssets;
      const b = rowB.original.totalAssets;
      return a > b ? 1 : a < b ? -1 : 0;
    },
  }),
  COLUMN_HELPER.accessor('totalSupply', {
    header: () => (
      <HeaderCell
        title="Shares"
        tooltip="Total liquid token shares outstanding"
      />
    ),
    cell: (props) => {
      const formatted = formatUnits(props.getValue(), 18);
      return (
        <TableCellWrapper>
          <Typography variant="body1">
            {Number(formatted).toLocaleString(undefined, {
              maximumFractionDigits: 4,
            })}
          </Typography>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`${PagePath.LIQUID_STAKING_DEPOSIT}?vault=${row.original.address}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button size="sm">Deposit</Button>
          </Link>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const LiquidDelegationVaultsTable: FC = () => {
  const { vaults, isLoading, error } = useLiquidDelegationVaults();
  const { assets } = useRestakeAssets();

  // Combine vault data with asset info
  const vaultsWithAssetInfo = useMemo<VaultWithAssetInfo[] | null>(() => {
    if (!vaults) return null;

    return vaults.map((vault) => {
      const assetInfo = assets?.get(vault.asset);
      return {
        ...vault,
        assetSymbol: assetInfo?.metadata.symbol ?? 'Unknown',
        assetDecimals: assetInfo?.metadata.decimals ?? 18,
      };
    });
  }, [vaults, assets]);

  const table = useReactTable(
    useMemo(
      () =>
        ({
          data: vaultsWithAssetInfo ?? [],
          columns: COLUMNS,
          initialState: {
            sorting: [{ id: 'totalAssets', desc: true }],
          },
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<VaultWithAssetInfo>,
      [vaultsWithAssetInfo],
    ),
  );

  if (isLoading) {
    return (
      <TableStatus
        title="Loading Vaults"
        description="Please wait while we load the liquid delegation vaults."
        icon={<Spinner size="lg" />}
      />
    );
  }

  if (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An error occurred while loading vaults.';

    return <TableStatus title="Error Loading Vaults" description={message} />;
  }

  if (!vaultsWithAssetInfo || vaultsWithAssetInfo.length === 0) {
    return (
      <TableStatus
        title="No Vaults Found"
        description="No liquid delegation vaults have been created yet."
      />
    );
  }

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      title={pluralize('vault', vaultsWithAssetInfo.length !== 1)}
      isPaginated
      tableProps={table}
      className={twMerge('px-2')}
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
  );
};

export default LiquidDelegationVaultsTable;
