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
import cx from 'classnames';
import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../../data/restake/useRestakeCurrentRound';
import type { DelegatorUnstakeRequest } from '../../../types/restake';
import type { IdentityType } from '../../../utils/polkadot';
import AvatarWithText from '../AvatarWithText';
import TableCell from '../TableCell';
import { calculateTimeRemaining } from '../utils';
import type { UnstakeRequestTableData } from './types';
import UnstakeRequestTableActions from './UnstakeRequestTableActions';

const columnsHelper = createColumnHelper<UnstakeRequestTableData>();

const columns = [
  columnsHelper.accessor('operatorAccountId', {
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

        <AvatarWithText
          accountAddress={props.getValue()}
          identityName={props.row.original.operatorIdentityName}
        />
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
  unstakeRequests: DelegatorUnstakeRequest[];
  operatorIdentities: Record<string, IdentityType | null>;
};

const UnstakeRequestTable = ({
  unstakeRequests,
  operatorIdentities,
}: Props) => {
  const { assetMap } = useRestakeContext();
  const { delegationBondLessDelay } = useRestakeConsts();
  const { currentRound } = useRestakeCurrentRound();

  const dataWithId = useMemo(
    () =>
      unstakeRequests.reduce(
        (acc, { assetId, amount, requestedRound, operatorAccountId }) => {
          const asset = assetMap[assetId];
          if (!asset) return acc;

          const formattedAmount = formatUnits(amount, asset.decimals);
          const timeRemaining = calculateTimeRemaining(
            currentRound,
            requestedRound,
            delegationBondLessDelay,
          );

          acc[getId({ assetId, operatorAccountId })] = {
            amount: Number(formattedAmount),
            amountRaw: amount,
            assetId: assetId,
            assetSymbol: asset.symbol,
            timeRemaining,
            operatorAccountId,
            operatorIdentityName: operatorIdentities?.[operatorAccountId]?.name,
          } satisfies UnstakeRequestTableData;

          return acc;
        },
        {} as Record<string, UnstakeRequestTableData>,
      ),
    // prettier-ignore
    [assetMap, currentRound, delegationBondLessDelay, operatorIdentities, unstakeRequests],
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
        getRowId: (row) => getId(row),
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
        <UnstakeRequestTableActions
          allRequests={Object.values(dataWithId)}
          selectedRequests={selectedRequests}
        />
      </div>
    </>
  );
};

export default UnstakeRequestTable;

function getId({
  assetId,
  operatorAccountId,
}: {
  assetId: string;
  operatorAccountId: string;
}) {
  return `${operatorAccountId}-${assetId}`;
}
