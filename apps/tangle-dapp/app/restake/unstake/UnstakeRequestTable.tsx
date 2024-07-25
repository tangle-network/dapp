'use client';

import { Checkbox as HeadlessCheckbox } from '@headlessui/react';
import {
  CheckCircledIcon,
  CheckIcon,
  DividerHorizontalIcon,
} from '@radix-ui/react-icons';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import { type ComponentProps, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../../data/restake/useRestakeCurrentRound';
import type { DelegatorBondLessRequest } from '../../../types/restake';

type Data = {
  amount: number;
  assetSymbol: string;
  timeRemaining: number;
};

const columnsHelper = createColumnHelper<Data>();

const columns = [
  columnsHelper.display({
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.toggleAllRowsSelected}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.toggleSelected}
      />
    ),
  }),
  columnsHelper.accessor('amount', {
    header: () => <TableCell>Amount</TableCell>,
    cell: (props) => (
      <TableCell fw="normal" className="text-mono-200 dark:text-mono-0">
        {props.getValue()} {props.row.original.assetSymbol}
      </TableCell>
    ),
  }),
  columnsHelper.accessor('timeRemaining', {
    enableSorting: false,
    header: () => <TableCell>Time Remaining</TableCell>,
    cell: (props) => {
      const value = props.getValue();

      return (
        <TableCell fw="normal" className="text-mono-200 dark:text-mono-0">
          {value === 0 ? (
            <span className="flex items-center gap-1">
              <CheckCircledIcon className="bg-green-50" />
              Ready
            </span>
          ) : value < 0 ? (
            'N/A'
          ) : (
            `${value} rounds`
          )}
        </TableCell>
      );
    },
  }),
];

type Props = {
  delegatorBondLessRequests: DelegatorBondLessRequest[];
};

const UnstakeRequestTable = ({ delegatorBondLessRequests }: Props) => {
  const { assetMap } = useRestakeContext();
  const { delegationBondLessDelay } = useRestakeConsts();
  const { currentRound } = useRestakeCurrentRound();

  const data = useMemo<Data[]>(
    () =>
      delegatorBondLessRequests
        .map(({ assetId, bondLessAmount, requestedRound }) => {
          const asset = assetMap[assetId];
          if (!asset) return null;

          const formattedAmount = formatUnits(bondLessAmount, asset.decimals);
          const timeRemaining = (() => {
            if (typeof delegationBondLessDelay !== 'number') return -1;

            const roundPassed = currentRound - requestedRound;
            if (roundPassed >= delegationBondLessDelay) return 0;

            return delegationBondLessDelay - roundPassed;
          })();

          return {
            amount: Number(formattedAmount),
            assetSymbol: asset.symbol,
            timeRemaining,
          } satisfies Data;
        })
        .filter((r): r is Data => Boolean(r)),
    [
      assetMap,
      currentRound,
      delegationBondLessDelay,
      delegatorBondLessRequests,
    ],
  );

  const table = useReactTable(
    useMemo(
      () => ({
        data,
        columns,
        initialState: {
          pagination: {
            pageSize: 5,
          },
        },
        enableRowSelection: true, //enable row selection for all rows
        // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
      }),
      [data],
    ),
  );

  return (
    <Table
      tableProps={table}
      isPaginated
      thClassName={cx(
        '!border-t-transparent !bg-transparent px-3 py-2 first:w-[18px]',
      )}
      tdClassName={cx(
        '!border-transparent !bg-transparent px-3 py-2 first:w-[18px]',
      )}
    />
  );
};

export default UnstakeRequestTable;

/**
 * @internal
 */
function Checkbox(props: ComponentProps<typeof HeadlessCheckbox>) {
  return (
    <HeadlessCheckbox
      {...props}
      className={twMerge(
        'form-checkbox group flex items-center justify-center overflow-hidden size-[18px]',
        'border border-mono-100 outline-none rounded',
        'bg-mono-0 dark:bg-mono-180',
        'enabled:hover:shadow-sm enabled:hover:shadow-blue-10 dark:hover:shadow-none',
        'data-[checked]:bg-blue-70 dark:data-[checked]:bg-blue-50',
        'data-[indeterminate]:bg-blue-70 dark:data-[indeterminate]:bg-blue-50',
        'data-[disabled]:cursor-not-allowed data-[disabled]:shadow-none',
        'data-[disabled]:border-mono-60 dark:data-[disabled]:border-mono-120',
        'data-[disabled]:bg-mono-0 dark:data-[disabled]:bg-mono-140',
      )}
    >
      <CheckIcon className="hidden group-data-[checked]:block" />
      <DividerHorizontalIcon className="hidden group-data-[indeterminate]:block" />
    </HeadlessCheckbox>
  );
}

/**
 * @internal
 */
function TableCell({
  className,
  children,
  variant = 'body2',
  ...props
}: Partial<ComponentProps<typeof Typography>>) {
  return (
    <Typography
      component="span"
      fw="semibold"
      {...props}
      variant={variant}
      className={twMerge('text-mono-120 dark:text-mono-100', className)}
    >
      {children}
    </Typography>
  );
}
