import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown } from '@tangle-network/icons/ChevronDown';
import Spinner from '@tangle-network/icons/Spinner';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import Button from '@tangle-network/webb-ui-components/components/buttons/Button';
import { CircularProgress } from '@tangle-network/webb-ui-components/components/CircularProgress';
import { Table } from '@tangle-network/webb-ui-components/components/Table';
import { TableVariant } from '@tangle-network/webb-ui-components/components/Table/types';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/webb-ui-components/constants';
import { Typography } from '@tangle-network/webb-ui-components/typography/Typography';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/webb-ui-components/utils/formatDisplayAmount';
import formatPercentage from '@tangle-network/webb-ui-components/utils/formatPercentage';
import pluralize from '@tangle-network/webb-ui-components/utils/pluralize';
import { FC, useMemo } from 'react';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { PagePath, QueryParamKey } from '../../../types';
import calculateBnRatio from '../../../utils/calculateBnRatio';
import type { VaultType } from '../../../utils/calculateVaults';
import sortByBn from '../../../utils/sortByBn';
import sortByLocaleCompare from '../../../utils/sortByLocaleCompare';
import { HeaderCell } from '../../tableCells';
import type { Props } from './types';

const COLUMN_HELPER = createColumnHelper<VaultType>();

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
    header: () => 'Available',
    sortingFn: sortByBn((row) => row.available),
    cell: (props) => {
      const value = props.getValue();
      const fmtAvailable =
        value === null
          ? EMPTY_VALUE_PLACEHOLDER
          : formatDisplayAmount(
              value,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      return <TableCellWrapper>{fmtAvailable}</TableCellWrapper>;
    },
  }),
  COLUMN_HELPER.accessor('totalDeposits', {
    header: () => 'Deposits',
    sortingFn: sortByBn((row) => row.totalDeposits),
    cell: (props) => {
      const value = props.getValue();
      const fmtDeposits =
        value === null
          ? EMPTY_VALUE_PLACEHOLDER
          : formatDisplayAmount(
              value,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      return <TableCellWrapper>{fmtDeposits}</TableCellWrapper>;
    },
  }),
  COLUMN_HELPER.accessor('reward', {
    sortingFn: sortByBn((row) => row.reward),
    header: () => (
      <HeaderCell
        title="Rewards"
        tooltip="Total annual deposit rewards per vault"
      />
    ),
    cell: (props) => {
      const value = props.getValue();
      const fmtRewards =
        value === null
          ? EMPTY_VALUE_PLACEHOLDER
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
    sortingFn: sortByBn((row) => row.tvl),
    header: () => (
      <HeaderCell
        title="TVL | Capacity"
        tooltip="Total value locked & deposit capacity."
      />
    ),
    cell: (props) => {
      const tvl = props.getValue();

      const fmtTvl =
        tvl === null
          ? EMPTY_VALUE_PLACEHOLDER
          : formatDisplayAmount(
              tvl,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      const depositCap = props.row.original.capacity;

      const fmtDepositCap =
        depositCap === null
          ? '∞'
          : formatDisplayAmount(
              depositCap,
              props.row.original.decimals,
              AmountFormatStyle.SHORT,
            );

      const capacityPercentage =
        tvl === null || depositCap === null
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
                row.getIsExpanded() ? '' : 'rotate-180',
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
  data = [],
  isLoading,
  emptyTableProps,
  loadingTableProps,
  tableProps,
}) => {
  const nativeTokenSymbol = useNetworkStore(
    (store) => store.network.tokenSymbol,
  );

  const table = useReactTable(
    useMemo(
      () =>
        ({
          data,
          columns: getColumns(nativeTokenSymbol),
          getCoreRowModel: getCoreRowModel(),
          getExpandedRowModel: getExpandedRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getRowCanExpand: (row) => row.original.tokenCount > 0,
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<VaultType>,
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
  } else if (data.length === 0) {
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
      tableClassName={tableProps?.tableClassName}
      thClassName={tableProps?.thClassName}
      tbodyClassName={tableProps?.tbodyClassName}
      trClassName={tableProps?.trClassName}
      tdClassName={tableProps?.tdClassName}
      paginationClassName={tableProps?.paginationClassName}
    />
  );
};

export default VaultsTable;
