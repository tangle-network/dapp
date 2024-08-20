'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { CheckboxCircleFill } from '@webb-tools/icons/CheckboxCircleFill';
import { TimeFillIcon } from '@webb-tools/icons/TimeFillIcon';
import { CheckBox } from '@webb-tools/webb-ui-components/components/CheckBox';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../../data/restake/useRestakeCurrentRound';
import type { DelegatorWithdrawRequest } from '../../../types/restake';
import TableCell from '../TableCell';
import { calculateTimeRemaining } from '../utils';
import type { WithdrawRequestTableData } from './types';
import WithdrawRequestTableActions from './WithdrawRequestTableActions';

const columnsHelper = createColumnHelper<WithdrawRequestTableData>();

const columns = [
  columnsHelper.accessor('assetId', {
    id: 'select',
    enableSorting: false,
    header: () => <TableCell>Select request to cancel</TableCell>,
    cell: (props) => (
      <div className="flex items-center justify-start gap-2">
        <CheckBox
          isChecked={props.row.getIsSelected()}
          isDisabled={!props.row.getCanSelect()}
          onChange={props.row.getToggleSelectedHandler()}
          wrapperClassName="pt-0.5 flex items-center justify-center"
        />

        <Typography variant="body1">
          {props.row.original.assetSymbol}
        </Typography>
      </div>
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
  withdrawRequests: DelegatorWithdrawRequest[];
};

const WithdrawRequestTable = ({ withdrawRequests }: Props) => {
  const { assetMap } = useRestakeContext();
  const { leaveDelegatorsDelay } = useRestakeConsts();
  const { currentRound } = useRestakeCurrentRound();

  const dataWithId = useMemo(
    () =>
      withdrawRequests.reduce(
        (acc, { assetId, amount, requestedRound }) => {
          const asset = assetMap[assetId];
          if (!asset) return acc;

          const formattedAmount = formatUnits(amount, asset.decimals);
          const timeRemaining = calculateTimeRemaining(
            currentRound,
            requestedRound,
            leaveDelegatorsDelay,
          );

          acc[assetId] = {
            amount: Number(formattedAmount),
            amountRaw: amount,
            assetId: assetId,
            assetSymbol: asset.symbol,
            timeRemaining,
          } satisfies WithdrawRequestTableData;

          return acc;
        },
        {} as Record<string, WithdrawRequestTableData>,
      ),
    [assetMap, currentRound, leaveDelegatorsDelay, withdrawRequests],
  );

  const table = useReactTable(
    useMemo<TableOptions<WithdrawRequestTableData>>(
      () => ({
        data: Object.values(dataWithId),
        columns,
        initialState: {
          pagination: {
            pageSize: 5,
          },
        },
        enableRowSelection: true,
        filterFns: {
          fuzzy: fuzzyFilter,
        },
        globalFilterFn: fuzzyFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
      }),
      [dataWithId],
    ),
  );

  const rowSelection = table.getSelectedRowModel().rows;

  const selectedRequests = useMemo(
    () => rowSelection.map((row) => row.original),
    [rowSelection],
  );

  return (
    <>
      <Table
        tableProps={table}
        isPaginated
        thClassName={cx('!border-t-transparent !bg-transparent px-3 py-2')}
        tdClassName={cx('!border-transparent !bg-transparent px-3 py-2')}
      />

      <div className="flex items-center gap-3">
        <WithdrawRequestTableActions
          allRequests={Object.values(dataWithId)}
          selectedRequests={selectedRequests}
        />
      </div>
    </>
  );
};

export default WithdrawRequestTable;
