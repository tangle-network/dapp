import { FC, useMemo } from 'react';
import { formatUnits, Address } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import { Link } from 'react-router';
import Spinner from '@tangle-network/icons/Spinner';
import HeaderCell from '@tangle-network/tangle-shared-ui/components/tables/HeaderCell';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import { useLiquidDelegationVaults } from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import { useRestakeAssets } from '@tangle-network/tangle-shared-ui/data/graphql';
import LIQUID_DELEGATION_VAULT_ABI from '@tangle-network/tangle-shared-ui/abi/liquidDelegationVault';
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

type UserPosition = {
  vaultAddress: Address;
  operator: Address;
  asset: Address;
  assetSymbol: string;
  assetDecimals: number;
  balance: bigint;
  balanceInAssets: bigint;
  selectionMode: number;
  blueprintIds: bigint[];
};

const COLUMN_HELPER = createColumnHelper<UserPosition>();

const shortenAddress = (address: Address) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const COLUMNS = [
  COLUMN_HELPER.accessor('operator', {
    header: () => <HeaderCell title="Vault" />,
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
  COLUMN_HELPER.accessor('balance', {
    header: () => (
      <HeaderCell title="Shares" tooltip="Your liquid token balance" />
    ),
    cell: (props) => {
      const formatted = formatUnits(props.getValue(), 18);
      return (
        <TableCellWrapper>
          <Typography variant="body1">
            {Number(formatted).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}
          </Typography>
        </TableCellWrapper>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.balance;
      const b = rowB.original.balance;
      return a > b ? 1 : a < b ? -1 : 0;
    },
  }),
  COLUMN_HELPER.accessor('balanceInAssets', {
    header: () => (
      <HeaderCell
        title="Value"
        tooltip="Current value of your position in underlying assets"
      />
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
              maximumFractionDigits: 6,
            })}{' '}
            {props.row.original.assetSymbol}
          </Typography>
        </TableCellWrapper>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.balanceInAssets;
      const b = rowB.original.balanceInAssets;
      return a > b ? 1 : a < b ? -1 : 0;
    },
  }),
  COLUMN_HELPER.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`${PagePath.LIQUID_STAKING_REDEEM}?vault=${row.original.vaultAddress}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="utility" className="uppercase body4">
              Redeem
            </Button>
          </Link>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const UserPositionsTable: FC = () => {
  const { address: userAddress } = useAccount();
  const { vaults, isLoading: isLoadingVaults } = useLiquidDelegationVaults();
  const { assets } = useRestakeAssets();

  // Build balance queries for all vaults
  const balanceContracts = useMemo(() => {
    if (!vaults || !userAddress) return [];

    return vaults.flatMap((vault) => [
      {
        address: vault.address,
        abi: LIQUID_DELEGATION_VAULT_ABI,
        functionName: 'balanceOf' as const,
        args: [userAddress] as const,
      },
    ]);
  }, [vaults, userAddress]);

  const { data: balanceResults, isLoading: isLoadingBalances } =
    useReadContracts({
      contracts: balanceContracts,
      query: {
        enabled: balanceContracts.length > 0,
      },
    });

  // Build conversion queries for vaults with balance
  const conversionContracts = useMemo(() => {
    if (!vaults || !balanceResults) return [];

    return vaults
      .map((vault, idx) => {
        const balanceResult = balanceResults[idx];
        if (balanceResult?.status !== 'success') return null;

        const balance = balanceResult.result as bigint;
        if (balance <= BigInt(0)) return null;

        return {
          address: vault.address,
          abi: LIQUID_DELEGATION_VAULT_ABI,
          functionName: 'convertToAssets' as const,
          args: [balance] as const,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [vaults, balanceResults]);

  const { data: conversionResults } = useReadContracts({
    contracts: conversionContracts,
    query: {
      enabled: conversionContracts.length > 0,
    },
  });

  // Build positions array
  const positions = useMemo<UserPosition[]>(() => {
    if (!vaults || !balanceResults) return [];

    const result: UserPosition[] = [];
    let conversionIdx = 0;

    vaults.forEach((vault, idx) => {
      const balanceResult = balanceResults[idx];
      if (balanceResult?.status !== 'success') return;

      const balance = balanceResult.result as bigint;
      if (balance <= BigInt(0)) return;

      const assetInfo = assets?.get(vault.asset);
      const conversionResult = conversionResults?.[conversionIdx];
      conversionIdx++;

      const balanceInAssets =
        conversionResult?.status === 'success'
          ? (conversionResult.result as bigint)
          : BigInt(0);

      result.push({
        vaultAddress: vault.address,
        operator: vault.operator,
        asset: vault.asset,
        assetSymbol: assetInfo?.metadata.symbol ?? 'Unknown',
        assetDecimals: assetInfo?.metadata.decimals ?? 18,
        balance,
        balanceInAssets,
        selectionMode: vault.selectionMode,
        blueprintIds: vault.blueprintIds,
      });
    });

    return result;
  }, [vaults, balanceResults, conversionResults, assets]);

  const table = useReactTable(
    useMemo(
      () =>
        ({
          data: positions,
          columns: COLUMNS,
          initialState: {
            sorting: [{ id: 'balanceInAssets', desc: true }],
          },
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<UserPosition>,
      [positions],
    ),
  );

  if (!userAddress) {
    return (
      <TableStatus
        title="Connect Wallet"
        description="Connect your wallet to view your liquid staking positions."
      />
    );
  }

  if (isLoadingVaults || isLoadingBalances) {
    return (
      <TableStatus
        title="Loading Positions"
        description="Please wait while we load your positions."
        icon={<Spinner size="lg" />}
      />
    );
  }

  if (positions.length === 0) {
    return (
      <TableStatus
        title="No Positions Found"
        description="You don't have any liquid staking positions yet. Deposit into a vault to get started."
      />
    );
  }

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      title={pluralize('position', positions.length !== 1)}
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

export default UserPositionsTable;
