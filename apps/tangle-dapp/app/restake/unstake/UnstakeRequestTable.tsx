'use client';

import { Checkbox as HeadlessCheckbox } from '@headlessui/react';
import { CheckIcon, DividerHorizontalIcon } from '@radix-ui/react-icons';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { CheckboxCircleFill } from '@webb-tools/icons/CheckboxCircleFill';
import { TimeFillIcon } from '@webb-tools/icons/TimeFillIcon';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import uniqueId from 'lodash/uniqueId';
import { type ComponentProps, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../../data/restake/useRestakeCurrentRound';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import type { DelegatorBondLessRequest } from '../../../types/restake';

type Data = {
  uid: string;
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
              <CheckboxCircleFill className="!fill-green-50" />
              ready
            </span>
          ) : value < 0 ? (
            'N/A'
          ) : (
            <span className="flex items-center gap-1">
              <TimeFillIcon className="!fill-blue-50" />
              {`${value} round${value > 1 ? 's' : ''}`}
            </span>
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

  // Transforming the array to object with uuid as key
  // for easier querying
  const unstakeRequestsWithId = useMemo(
    () =>
      delegatorBondLessRequests.reduce(
        (acc, current) => {
          const uid = uniqueId('delegator-bond-less-request-');
          acc[uid] = { ...current, uid };
          return acc;
        },
        {} as Record<string, DelegatorBondLessRequest & { uid: string }>,
      ),
    [delegatorBondLessRequests],
  );

  const dataWithId = useMemo(
    () =>
      Object.values(unstakeRequestsWithId).reduce(
        (acc, { assetId, bondLessAmount, requestedRound, uid }) => {
          const asset = assetMap[assetId];
          if (!asset) return acc;

          const formattedAmount = formatUnits(bondLessAmount, asset.decimals);
          const timeRemaining = calculateTimeRemaining(
            currentRound,
            requestedRound,
            delegationBondLessDelay,
          );

          acc[uid] = {
            amount: Number(formattedAmount),
            assetSymbol: asset.symbol,
            timeRemaining,
            uid,
          } satisfies Data;

          return acc;
        },
        {} as Record<string, Data>,
      ),
    [assetMap, currentRound, delegationBondLessDelay, unstakeRequestsWithId],
  );

  const table = useReactTable(
    useMemo<TableOptions<Data>>(
      () => ({
        data: Object.values(dataWithId),
        columns,
        initialState: {
          pagination: {
            pageSize: 5,
          },
        },
        getRowId: (row) => row.uid,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
      }),
      [dataWithId],
    ),
  );

  const selectedRows = table.getState().rowSelection;

  const canCancelUnstake = useMemo(() => {
    const entries = Object.entries(selectedRows);
    if (entries.length === 0) return false;

    return entries.some(([, selected]) => selected);
  }, [selectedRows]);

  const canExecuteUnstake = useMemo(() => {
    const entries = Object.entries(selectedRows);
    if (entries.length === 0) return false;

    return entries.every(([uid, selected]) => {
      if (!selected || !dataWithId[uid]) return false;

      const { timeRemaining } = dataWithId[uid];
      return isUnstakeReady(timeRemaining);
    });
  }, [dataWithId, selectedRows]);

  const options = useRestakeTxEventHandlersWithNoti();
  const { executeDelegatorBondLess, cancelDelegatorBondLess } = useRestakeTx();

  return (
    <>
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

      <div className="flex items-center gap-3">
        <Button
          className="flex-1"
          isDisabled={!canCancelUnstake}
          isFullWidth
          onClick={() => cancelDelegatorBondLess(options)}
          variant="secondary"
        >
          Cancel Unstake
        </Button>

        <Button
          className="flex-1"
          isDisabled={!canExecuteUnstake}
          isFullWidth
          onClick={() => executeDelegatorBondLess(options)}
        >
          Execute Unstake
        </Button>
      </div>
    </>
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

/**
 * @internal
 */
function calculateTimeRemaining(
  currentRound: number,
  requestedRound: number,
  delegationBondLessDelay: number | null,
) {
  if (typeof delegationBondLessDelay !== 'number') return -1;

  const roundPassed = currentRound - requestedRound;
  if (roundPassed >= delegationBondLessDelay) return 0;

  return delegationBondLessDelay - roundPassed;
}

/**
 * @internal
 */
function isUnstakeReady(timeRemaining: number) {
  return timeRemaining === 0;
}
