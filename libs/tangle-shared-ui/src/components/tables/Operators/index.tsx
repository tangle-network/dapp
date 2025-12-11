'use client';

import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CheckboxCircleFill } from '@tangle-network/icons/CheckboxCircleFill';
import {
  Avatar,
  Button,
  IconWithTooltip,
  KeyValueWithButton,
  shortenString,
  Table,
  Typography,
} from '@tangle-network/ui-components';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import type { ComponentProps, PropsWithChildren } from 'react';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';
import TableCellWrapper from '../../../components/tables/TableCellWrapper';
import type { TableStatusProps } from '../../../components/tables/TableStatus';
import TableStatus from '../../../components/tables/TableStatus';
import { RestakeOperator } from '../../../types';
import VaultsDropdown from './VaultsDropdown';

const COLUMN_HELPER = createColumnHelper<RestakeOperator>();

const formatAmount = (amount: bigint, decimals = 18): string => {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
};

const getStaticColumns = (
  tokenSymbol: string,
): ColumnDef<RestakeOperator, any>[] => [
  COLUMN_HELPER.accessor('address', {
    header: () => 'Identity',
    cell: (props) => {
      const {
        address,
        identityName: identity,
        isDelegated,
      } = props.row.original;

      return (
        <TableCellWrapper className="p-3">
          <div className="flex items-center flex-1 gap-3 pr-3">
            <Avatar
              sourceVariant="address"
              value={address}
              theme="ethereum"
              size="lg"
              className="shadow-sm"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Typography
                  variant="h5"
                  fw="bold"
                  className="text-mono-200 dark:text-mono-0"
                >
                  {identity ? identity : shortenString(address)}
                </Typography>

                {isDelegated && (
                  <IconWithTooltip
                    icon={
                      <CheckboxCircleFill className="!fill-green-60 dark:!fill-green-50" />
                    }
                    content="Delegated"
                  />
                )}
              </div>

              <KeyValueWithButton
                keyValue={address}
                size="sm"
                className="text-mono-140 dark:text-mono-80"
              />
            </div>
          </div>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('selfBondedAmount', {
    header: () => 'Self-Bonded',
    cell: (props) => {
      const value = props.getValue();

      return (
        <TableCellWrapper className="p-3">
          <Typography
            variant="body1"
            fw="semibold"
            className="text-mono-160 dark:text-mono-60"
          >
            {formatAmount(value)}{' '}
            <span className="text-mono-120 dark:text-mono-100">
              {tokenSymbol}
            </span>
          </Typography>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('instanceCount', {
    header: () => 'Instances',
    cell: (props) => (
      <TableCellWrapper className="p-3">
        <Typography
          variant="body1"
          fw="semibold"
          className="text-mono-160 dark:text-mono-60"
        >
          {props.getValue() ?? 0}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  COLUMN_HELPER.accessor('restakersCount', {
    header: () => 'Restakers',
    cell: (props) => (
      <TableCellWrapper className="p-3">
        <Typography
          variant="body1"
          fw="semibold"
          className="text-mono-160 dark:text-mono-60"
        >
          {props.getValue()}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  // For sorting purpose
  COLUMN_HELPER.accessor('isDelegated', {
    header: () => null,
    cell: () => null,
    sortingFn: (rowA, rowB) => {
      const aIsDelegated = rowA.original.isDelegated;
      const bIsDelegated = rowB.original.isDelegated;

      return aIsDelegated ? -1 : bIsDelegated ? 1 : 0;
    },
  }),
  COLUMN_HELPER.accessor('vaultTokens', {
    header: () => 'Delegated Assets',
    cell: (props) => {
      const tokensList = props.getValue();

      return (
        <TableCellWrapper removeRightBorder className="p-3">
          {tokensList.length > 0 ? (
            <VaultsDropdown vaultTokens={tokensList} />
          ) : (
            <Typography
              variant="body1"
              className="text-mono-140 dark:text-mono-80"
            >
              No vaults
            </Typography>
          )}
        </TableCellWrapper>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aVaultTokens = rowA.original.vaultTokens;
      const bVaultTokens = rowB.original.vaultTokens;

      return aVaultTokens.length - bVaultTokens.length;
    },
  }),
];

type Props = {
  isLoading?: boolean;
  data?: RestakeOperator[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableProps?: Partial<ComponentProps<typeof Table<RestakeOperator>>>;
  RestakeOperatorAction?: React.FC<PropsWithChildren<{ address: string }>>;
  tokenSymbol?: string;
};

const OperatorsTable: FC<Props> = ({
  data = [],
  isLoading,
  loadingTableProps,
  emptyTableProps,
  tableProps,
  globalFilter,
  onGlobalFilterChange,
  RestakeOperatorAction,
  tokenSymbol = 'ETH',
}) => {
  const columns = useMemo(() => {
    return getStaticColumns(tokenSymbol).concat([
      COLUMN_HELPER.display({
        id: 'actions',
        header: () => null,
        cell: (props) => (
          <TableCellWrapper removeRightBorder className="p-3">
            <div className="flex items-center justify-end flex-1 gap-2">
              {RestakeOperatorAction ? (
                <RestakeOperatorAction address={props.row.original.address}>
                  <Button
                    variant="utility"
                    className="uppercase body4 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40 hover:bg-blue-20 dark:hover:bg-blue-110 border border-blue-30 dark:border-blue-100 transition-all duration-200 font-semibold"
                  >
                    Delegate
                  </Button>
                </RestakeOperatorAction>
              ) : (
                <Button
                  variant="utility"
                  className="uppercase body4 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40 hover:bg-blue-20 dark:hover:bg-blue-110 border border-blue-30 dark:border-blue-100 transition-all duration-200 font-semibold"
                >
                  Delegate
                </Button>
              )}
            </div>
          </TableCellWrapper>
        ),
        enableSorting: false,
      }) satisfies ColumnDef<RestakeOperator>,
    ]);
  }, [RestakeOperatorAction, tokenSymbol]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [
        {
          id: 'isDelegated',
          desc: false,
        },
        {
          id: 'vaultTokens',
          desc: true,
        },
        {
          id: 'restakersCount',
          desc: true,
        },
      ],
      columnVisibility: {
        isDelegated: false,
      },
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange,
    getRowId: (row) => row.address,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    enableGlobalFilter: true,
  });

  if (isLoading) {
    return (
      <TableStatus
        title="Loading Operators"
        description="Please wait while we load the operators."
        icon="🔄"
        {...loadingTableProps}
        className={loadingTableProps?.className}
      />
    );
  } else if (data.length === 0) {
    return (
      <TableStatus
        title="No Operators Found"
        description="It looks like there are no operators running at the moment."
        icon="⚙️"
        {...emptyTableProps}
        className={emptyTableProps?.className}
      />
    );
  }

  return (
    <Table
      title={pluralize('operator', data.length !== 1)}
      variant={TableVariant.GLASS_OUTER}
      isPaginated
      {...tableProps}
      tableProps={table}
      className={tableProps?.className}
      tableClassName={tableProps?.tableClassName}
      thClassName={tableProps?.thClassName}
      tbodyClassName={tableProps?.tbodyClassName}
      trClassName={twMerge('group overflow-hidden', tableProps?.trClassName)}
      tdClassName={tableProps?.tdClassName}
      paginationClassName={tableProps?.paginationClassName}
    />
  );
};

export default OperatorsTable;
