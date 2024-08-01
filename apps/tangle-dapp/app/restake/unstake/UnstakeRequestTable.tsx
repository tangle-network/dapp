'use client';

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
import { CheckBox } from '@webb-tools/webb-ui-components/components/CheckBox';
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
import type { DelegatorBondLessRequest } from '../../../types/restake';
import type { UnstakeRequestTableData } from './types';
import { calculateTimeRemaining } from './utils';

const columnsHelper = createColumnHelper<UnstakeRequestTableData>();

const columns = [
  columnsHelper.display({
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <CheckBox
        isChecked={table.getIsAllRowsSelected()}
        // TODO: Add indeterminate state for CheckBox
        // indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        wrapperClassName={cx('min-h-0')}
      />
    ),
    cell: ({ row }) => (
      <CheckBox
        isChecked={row.getIsSelected()}
        isDisabled={!row.getCanSelect()}
        // TODO: Add indeterminate state for CheckBox
        // indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
        wrapperClassName={cx('min-h-0')}
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
          } satisfies UnstakeRequestTableData;

          return acc;
        },
        {} as Record<string, UnstakeRequestTableData>,
      ),
    [assetMap, currentRound, delegationBondLessDelay, unstakeRequestsWithId],
  );

  const table = useReactTable(
    useMemo<TableOptions<UnstakeRequestTableData>>(
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

  /* const rowSelection = table.getState().rowSelection;

  const selectedRequestIds = useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, selected]) => selected)
        .map(([uid]) => uid),
    [rowSelection],
  ); */

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

      {/*       <div className="flex items-center gap-3">
        <UnstakeRequestTableActions
          selectedRequestIds={selectedRequestIds}
          dataWithId={dataWithId}
        />
      </div> */}
    </>
  );
};

export default UnstakeRequestTable;

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
