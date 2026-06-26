import { type FC } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Button,
  CircularProgress,
  Text,
} from '../../../components/sandbox/SandboxUi';
import { ChevronDown } from '@tangle-network/icons';
import { TangleCloudTable } from '../../../components/tangleCloudTable';
import type { StakingVault } from '@tangle-network/tangle-shared-ui/types/staking';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { formatUnits } from 'viem';
import { twMerge } from 'tailwind-merge';
import type {
  TableStatusProps,
  TangleCloudTableProps,
} from '../../../components/tangleCloudTable/type';
import { Link } from 'react-router';
import { TangleDAppPagePath } from '../../../types';

// Locally typed to avoid pulling in `@polkadot/util` for a type-only reference.
// The shared `StakingVault` shape uses BN for some amount fields; we only ever
// call `.toString()` on them, so a structural type is sufficient.
type BigIntish = bigint | { toString(): string };

const toBigInt = (value: BigIntish): bigint =>
  typeof value === 'bigint' ? value : BigInt(value.toString());
const pluralize = (word: string, plural: boolean) =>
  plural ? `${word}s` : word;
const formatPercentage = (value: number) =>
  `${(value * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;

const formatAmount = (amount: BigIntish, decimals: number): string => {
  const formatted = formatUnits(toBigInt(amount), decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

const calculateRatio = (a: BigIntish, b: BigIntish): number => {
  const aBigInt = toBigInt(a);
  const bBigInt = toBigInt(b);
  if (bBigInt === BigInt(0)) return 0;
  return Number((aBigInt * BigInt(10000)) / bBigInt) / 10000;
};

const EMPTY_VALUE_PLACEHOLDER = '-';

const COLUMN_HELPER = createColumnHelper<StakingVault>();

const getColumns = () => [
  COLUMN_HELPER.accessor('name', {
    header: () => 'Vault',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon
            name={props.row.original.representAssetSymbol}
            size="lg"
          />
          <Text variant="h5" className="whitespace-nowrap">
            {props.getValue()}
          </Text>
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
          : formatAmount(value, props.row.original.decimals);

      return <TableCellWrapper>{fmtDeposits}</TableCellWrapper>;
    },
  }),
  COLUMN_HELPER.accessor('tvl', {
    sortUndefined: 'last',
    header: () => 'TVL | Capacity',
    cell: (props) => {
      const tvl = props.getValue();

      const fmtTvl =
        tvl === undefined
          ? EMPTY_VALUE_PLACEHOLDER
          : formatAmount(tvl, props.row.original.decimals);

      const depositCap = props.row.original.capacity;

      const fmtDepositCap =
        depositCap === undefined
          ? '∞'
          : formatAmount(depositCap, props.row.original.decimals);

      const capacityPercentage =
        tvl === undefined || depositCap === undefined
          ? null
          : calculateRatio(tvl, depositCap);

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

            <Text variant="body1">
              {fmtTvl === null
                ? `${fmtDepositCap}`
                : `${fmtTvl} | ${fmtDepositCap}`}
            </Text>
          </div>
        </TableCellWrapper>
      );
    },
  }),
  COLUMN_HELPER.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) => {
      return (
        <TableCellWrapper removeRightBorder>
          <div className="flex items-center justify-end flex-1 gap-2">
            <Link
              to={TangleDAppPagePath.STAKING_DEPOSIT.replace(
                '{{vault}}',
                row.original.id.toString(),
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <Button variant="utility" className="uppercase body4">
                Deposit
              </Button>
            </Link>

            <Button
              variant="utility"
              isJustIcon
              isDisabled={!row.getCanExpand()}
            >
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
      );
    },
    enableSorting: false,
  }),
];

type Props = {
  data: StakingVault[];
  isLoading: boolean;
  error: Error | null;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableConfig: TangleCloudTableProps<StakingVault>['tableConfig'];
};

export const TotalValueLockedTable: FC<Props> = ({
  data,
  isLoading,
  error,
  loadingTableProps = {},
  emptyTableProps = {},
  tableConfig,
}) => {
  const columns = getColumns();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: (row) => row.original.assetMetadata.length > 0,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<StakingVault>
      title={pluralize('blueprint', data.length !== 1)}
      data={data}
      error={error}
      isLoading={isLoading}
      loadingTableProps={loadingTableProps}
      emptyTableProps={emptyTableProps}
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
        expandedRowClassName: twMerge(
          'bg-mono-0 dark:bg-mono-190',
          'peer-[&[data-expanded="true"]:hover]:bg-mono-20/50 dark:bg-mono-190/50',
        ),
        ...tableConfig,
      }}
    />
  );
};

TotalValueLockedTable.displayName = 'TotalValueLockedTable';
