import { ChevronDown } from '@tangle-network/icons/ChevronDown';
import Spinner from '@tangle-network/icons/Spinner';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { CircularProgress } from '@tangle-network/ui-components/components/CircularProgress';
import { Table } from '@tangle-network/ui-components/components/Table';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components/utils/formatDisplayAmount';
import formatPercentage from '@tangle-network/ui-components/utils/formatPercentage';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import sortByBnToDecimal from '@tangle-network/ui-components/utils/sortByBnToDecimal';
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo } from 'react';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { PagePath, QueryParamKey } from '../../../types';
import calculateBnRatio from '@tangle-network/ui-components/utils/calculateBnRatio';
import sortByLocaleCompare from '../../../utils/sortByLocaleCompare';
import { HeaderCell } from '../../tableCells';
import type { Props } from './types';
import { RestakeVault } from '@tangle-network/tangle-shared-ui/utils/createVaultMap';

const COLUMN_HELPER = createColumnHelper<RestakeVault>();

const getColumns = (nativeTokenSymbol: string) => [
  COLUMN_HELPER.accessor('name', {
    header: () => 'Vault',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon
            name={props.row.original.representAssetSymbol}
            size="lg"
          />
          <Typography variant="h5" className="whitespace-nowrap">
            {props.getValue()}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
    sortingFn: sortByLocaleCompare((row) => row.name),
    sortDescFirst: true,
  }),
  COLUMN_HELPER.accessor('available', {
    sortUndefined: 'last',
    sortingFn: sortByBnToDecimal(
      (row) => row.available,
      (row) => row.decimals,
    ),
    header: () => 'Available',
    cell: (props) => {
      const value = props.getValue();

      const fmtAvailable =
        value === undefined
          ? 0
          : formatDisplayAmount(
              value,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      return <TableCellWrapper>{fmtAvailable}</TableCellWrapper>;
    },
  }),
  COLUMN_HELPER.accessor('totalDeposits', {
    sortUndefined: 'last',
    sortingFn: sortByBnToDecimal(
      (row) => row.totalDeposits,
      (row) => row.decimals,
    ),
    header: () => 'Deposits',
    cell: (props) => {
      const value = props.getValue();

      const fmtDeposits =
        value === undefined
          ? 0
          : formatDisplayAmount(
              value,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      return <TableCellWrapper>{fmtDeposits}</TableCellWrapper>;
    },
  }),
  COLUMN_HELPER.accessor('reward', {
    sortUndefined: 'last',
    sortingFn: sortByBnToDecimal(
      (row) => row.reward,
      (row) => row.decimals,
    ),
    header: () => (
      <HeaderCell
        title="Rewards"
        tooltip="Total annual deposit rewards per vault"
      />
    ),
    cell: (props) => {
      const value = props.getValue();

      const fmtRewards =
        value === undefined
          ? 0
          : formatDisplayAmount(
              value,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      return (
        <TableCellWrapper removeRightBorder>
          {fmtRewards} {nativeTokenSymbol}
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.accessor('tvl', {
    sortUndefined: 'last',
    sortingFn: sortByBnToDecimal(
      (row) => row.tvl,
      (row) => row.decimals,
    ),
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
          ? 0
          : formatDisplayAmount(
              tvl,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      const depositCap = props.row.original.capacity;

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
        <TableCellWrapper removeRightBorder>
          <div className="flex items-center justify-center gap-1">
            {capacityPercentage !== null && (
              <CircularProgress
                progress={capacityPercentage}
                size="md"
                tooltip={formatPercentage(capacityPercentage)}
              />
            )}

            <Typography variant="body1" className="dark:text-mono-0">
              {fmtTvl === null
                ? `${fmtDepositCap}`
                : `${fmtTvl} | ${fmtDepositCap}`}
            </Typography>
          </div>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1 gap-2">
          <Link
            to={`${PagePath.RESTAKE_DEPOSIT}?${QueryParamKey.RESTAKE_VAULT}=${row.original.id}`}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Button variant="utility" className="uppercase body4">
              Deposit
            </Button>
          </Link>

          <Button variant="utility" isJustIcon isDisabled={!row.getCanExpand()}>
            <div
              className={twMerge(
                '!text-current transition-transform duration-300 ease-in-out',
                row.getIsExpanded() ? 'rotate-180' : '',
              )}
            >
              <ChevronDown className="!fill-current" />
            </div>
          </Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const VaultsTable: FC<Props> = ({
  data,
  emptyTableProps,
  loadingTableProps,
  tableProps,
  isLoading,
}) => {
  const nativeTokenSymbol = useNetworkStore(
    (store) => store.network.tokenSymbol,
  );

  const table = useReactTable(
    useMemo(
      () =>
        ({
          data: data ?? [],
          columns: getColumns(nativeTokenSymbol),
          getCoreRowModel: getCoreRowModel(),
          getExpandedRowModel: getExpandedRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getRowCanExpand: (row) => row.original.tokenCount > 0,
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<RestakeVault>,
      [data, nativeTokenSymbol],
    ),
  );

  if (isLoading) {
    return (
      <TableStatus
        title="Loading Vaults"
        description="Please wait while we load the vaults."
        icon={<Spinner size="lg" />}
        {...loadingTableProps}
        className={loadingTableProps?.className}
      />
    );
  } else if (data === null || data.length === 0) {
    return (
      <TableStatus
        title="No Vaults Found"
        description="It looks like there are no vaults at the moment."
        {...emptyTableProps}
        className={emptyTableProps?.className}
      />
    );
  }

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      title={pluralize('vault', data.length !== 1)}
      isPaginated
      {...tableProps}
      tableProps={table}
      className={tableProps?.className}
      tableWrapperClassName="py-2"
      tableClassName={twMerge(
        'border-collapse border-spacing-0',
        tableProps?.tableClassName,
      )}
      expandedRowClassName={twMerge(
        'bg-mono-0 dark:bg-mono-180',
        'peer-[&[data-expanded="true"]:hover]:bg-mono-20',
        'peer-[&[data-expanded="true"]:hover]:dark:bg-mono-170',
        'last:border-b-0',
      )}
      thClassName={twMerge('py-2', tableProps?.thClassName)}
      tbodyClassName={twMerge(
        '[&_tr:first-child_td:first-child]:rounded-tl-xl [&_tr:first-child_td:last-child]:rounded-tr-xl',
        '[&_tr:last-child_td:first-child]:rounded-bl-xl [&_tr:last-child_td:last-child]:rounded-br-xl',
        tableProps?.tbodyClassName,
      )}
      trClassName={twMerge('last:border-b-0', tableProps?.trClassName)}
      tdClassName={twMerge(
        'first:rounded-l-none last:rounded-r-none',
        tableProps?.tdClassName,
      )}
      paginationClassName={tableProps?.paginationClassName}
    />
  );
};

export default VaultsTable;
