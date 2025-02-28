import { type FC } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  AmountFormatStyle,
  Button,
  CircularProgress,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  Typography,
} from '@tangle-network/ui-components';
import { TableStatusProps } from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import { ChevronDown } from '@tangle-network/icons';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable';
import type { VaultType } from '@tangle-network/ui-components/utils/calculateVaults';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import calculateBnRatio from '@tangle-network/ui-components/utils/calculateBnRatio';
import formatPercentage from '@tangle-network/ui-components/utils/formatPercentage';
import { twMerge } from 'tailwind-merge';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

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
    sortDescFirst: true,
  }),
  COLUMN_HELPER.accessor('totalDeposits', {
    sortUndefined: 'last',
    header: () => 'Deposits',
    cell: (props) => {
      const value = props.getValue();
      const fmtDeposits =
        value === undefined
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
    sortUndefined: 'last',
    header: () => "Rewards",
    cell: (props) => {
      const value = props.getValue();
      const fmtRewards =
        value === undefined
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
    sortUndefined: 'last',
    header: () => "TVL | Capacity",
    cell: (props) => {
      const tvl = props.getValue();

      const fmtTvl =
        tvl === undefined
          ? EMPTY_VALUE_PLACEHOLDER
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
          {/* <Link
            to={`${PagePath.RESTAKE_DEPOSIT}?${QueryParamKey.RESTAKE_VAULT}=${row.original.id}`}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Button variant="utility" className="uppercase body4">
              Deposit
            </Button>
          </Link> */}

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


type Props = {
  data: VaultType[];
  isLoading: boolean;
  error: Error | null;
  loadingTableProps: Partial<TableStatusProps>;
  emptyTableProps: Partial<TableStatusProps>;
};

export const TotalValueLockedTable: FC<Props> = ({ 
  data,
  isLoading,
  error,
  loadingTableProps,
  emptyTableProps,
}) => {
  const nativeTokenSymbol = useNetworkStore(
    (store) => store.network.tokenSymbol,
  );
  const columns = getColumns(nativeTokenSymbol);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });
  const isEmpty = data.length === 0;

  return (
    <TangleCloudTable<VaultType>
      title={pluralize('blueprint', !isEmpty)}
      data={data}
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

TotalValueLockedTable.displayName = 'TotalValueLockedTable';
