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
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import type { DelegatorWithdrawRequest } from '@webb-tools/tangle-shared-ui/types/restake';
import { CheckBox } from '@webb-tools/webb-ui-components/components/CheckBox';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useMemo } from 'react';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../../data/restake/useRestakeCurrentRound';
import TableCell from '../TableCell';
import { calculateTimeRemaining } from '../utils';
import type { WithdrawRequestTableData } from './types';
import WithdrawRequestTableActions from './WithdrawRequestTableActions';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@webb-tools/webb-ui-components';
import { BN } from '@polkadot/util';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';

const columnsHelper = createColumnHelper<WithdrawRequestTableData>();

const columns = [
  columnsHelper.accessor('assetId', {
    id: 'select',
    enableSorting: false,
    header: () => <TableCell>Request</TableCell>,
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
              {`${value} session${value > 1 ? 's' : ''}`}
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

          if (!asset) {
            return acc;
          }

          const fmtAmount = formatDisplayAmount(
            new BN(amount.toString()),
            asset.decimals,
            AmountFormatStyle.SHORT,
          );

          const timeRemaining = calculateTimeRemaining(
            currentRound,
            requestedRound,
            leaveDelegatorsDelay,
          );

          acc[assetId] = {
            amount: fmtAmount,
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

  const rows = useMemo(() => Object.values(dataWithId), [dataWithId]);

  const table = useReactTable(
    useMemo<TableOptions<WithdrawRequestTableData>>(
      () => ({
        data: rows,
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
      [rows],
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
        variant={TableVariant.DEFAULT}
        tableProps={table}
        isPaginated
        title={pluralize('request', rows.length !== 1)}
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
