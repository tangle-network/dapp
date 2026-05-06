import { FC, useMemo } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Button,
  KeyValueWithButton,
  Table,
  Typography,
} from '@tangle-network/ui-components';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import type { Operator } from '../../data/graphql/useOperators';
import { formatUnits, Address } from 'viem';
import { twMerge } from 'tailwind-merge';
import TableCellWrapper from './TableCellWrapper';
import TableStatus from './TableStatus';

interface Props {
  operatorMap: Map<Address, Operator> | null;
  isLoading: boolean;
  onStakeClicked?: (operatorAddress?: Address) => void;
}

const formatStake = (stake: bigint | null): string => {
  if (stake === null) return '0';
  const formatted = formatUnits(stake, 18);
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

const getStatusStyles = (
  status: string | null,
): { bg: string; text: string } => {
  switch (status) {
    case 'ACTIVE':
      return {
        bg: 'bg-green-50/10 dark:bg-green-50/20',
        text: 'text-green-50',
      };
    case 'LEAVING':
      return {
        bg: 'bg-yellow-50/10 dark:bg-yellow-50/20',
        text: 'text-yellow-50',
      };
    case 'INACTIVE':
      return {
        bg: 'bg-red-50/10 dark:bg-red-50/20',
        text: 'text-red-50',
      };
    default:
      return {
        bg: 'bg-mono-80/10 dark:bg-mono-100/20',
        text: 'text-mono-100',
      };
  }
};

const columnHelper = createColumnHelper<Operator>();

export const OperatorsTable: FC<Props> = ({
  operatorMap,
  isLoading,
  onStakeClicked,
}) => {
  const onManageStakeClick = onStakeClicked;

  const operators = useMemo(
    () => (operatorMap ? Array.from(operatorMap.values()) : []),
    [operatorMap],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => 'Identity',
        cell: (info) => {
          const id = info.getValue();
          return (
            <TableCellWrapper className="p-3">
              <div className="flex items-center flex-1 gap-3 pr-3">
                <Avatar
                  sourceVariant="address"
                  value={id}
                  theme="ethereum"
                  size="lg"
                  className="shadow-sm"
                />

                <div className="flex-1">
                  <Typography
                    variant="h5"
                    fw="bold"
                    className="text-mono-200 dark:text-mono-0 mb-1"
                  >
                    {id.slice(0, 6)}...{id.slice(-4)}
                  </Typography>

                  <KeyValueWithButton
                    keyValue={id}
                    size="sm"
                    className="text-mono-140 dark:text-mono-80"
                  />
                </div>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('stakingStake', {
        header: () => 'Staking Stake',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography
              variant="body1"
              fw="semibold"
              className="text-mono-160 dark:text-mono-60"
            >
              {formatStake(info.getValue())}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      columnHelper.accessor('stakingDelegationCount', {
        header: () => 'Delegations',
        cell: (info) => (
          <TableCellWrapper className="p-3">
            <Typography
              variant="body1"
              fw="semibold"
              className="text-mono-160 dark:text-mono-60"
            >
              {info.getValue()?.toString() ?? '0'}
            </Typography>
          </TableCellWrapper>
        ),
      }),
      columnHelper.accessor('stakingStatus', {
        header: () => 'Status',
        cell: (info) => {
          const status = info.getValue();
          const styles = getStatusStyles(status);
          return (
            <TableCellWrapper className="p-3">
              <span
                className={twMerge(
                  'px-3 py-1.5 rounded-full text-xs font-semibold',
                  styles.bg,
                  styles.text,
                )}
              >
                {status ?? 'Unknown'}
              </span>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => null,
        cell: (info) => {
          const isActive = info.row.original.stakingStatus === 'ACTIVE';
          const operatorAddress = info.row.original.id
            ? (info.row.original.id as Address)
            : undefined;
          return (
            <TableCellWrapper removeRightBorder className="p-3">
              <div className="flex items-center justify-end flex-1 gap-2">
                <Button
                  variant="utility"
                  className={twMerge(
                    'uppercase body4 font-semibold transition-all duration-200',
                    'bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40',
                    'hover:bg-blue-20 dark:hover:bg-blue-110',
                    'border border-blue-30 dark:border-blue-100',
                  )}
                >
                  View
                </Button>

                <Button
                  variant="utility"
                  onClick={() => onManageStakeClick?.(operatorAddress)}
                  isDisabled={!isActive}
                  className={twMerge(
                    'uppercase body4 font-semibold transition-all duration-200',
                    'bg-purple-10 dark:bg-purple-120 text-purple-70 dark:text-purple-40',
                    'hover:bg-purple-20 dark:hover:bg-purple-110',
                    'border border-purple-30 dark:border-purple-100',
                  )}
                >
                  Manage
                </Button>
              </div>
            </TableCellWrapper>
          );
        },
      }),
    ],
    [onManageStakeClick],
  );

  const table = useReactTable({
    data: operators,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
  });

  if (isLoading) {
    return (
      <TableStatus
        title="Loading Operators"
        description="Please wait while we load the operators."
        icon="🔄"
      />
    );
  }

  if (operators.length === 0) {
    return (
      <TableStatus
        title="No Operators Found"
        description="It looks like there are no operators running at the moment."
        icon="⚙️"
        buttonText="Register as Operator"
        buttonProps={{ onClick: () => onManageStakeClick?.() }}
      />
    );
  }

  return (
    <Table
      title={pluralize('operator', operators.length !== 1)}
      variant={TableVariant.GLASS_OUTER}
      isPaginated
      tableProps={table}
      trClassName="group overflow-hidden"
    />
  );
};

export default OperatorsTable;
