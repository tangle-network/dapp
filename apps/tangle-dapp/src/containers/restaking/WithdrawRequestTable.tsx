import { BN } from '@polkadot/util';
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
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import type { DelegatorWithdrawRequest } from '@webb-tools/tangle-shared-ui/types/restake';
import {
  AmountFormatStyle,
  formatDisplayAmount,
  isEvmAddress,
} from '@webb-tools/webb-ui-components';
import { CheckBox } from '@webb-tools/webb-ui-components/components/CheckBox';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC, useMemo } from 'react';
import TableCell from '../../components/restaking/TableCell';
import useRestakeConsts from '../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../data/restake/useRestakeCurrentRound';
import useSessionDurationMs from '../../data/useSessionDurationMs';
import { calculateTimeRemaining } from '../../pages/restake/utils';
import formatSessionDistance from '../../utils/formatSessionDistance';
import WithdrawRequestTableActions from './WithdrawRequestTableActions';
import { findErc20Token } from '@webb-tools/tangle-shared-ui/hooks/useTangleEvmErc20Balances';

export type WithdrawRequestTableRow = {
  amount: string;
  amountRaw: bigint;
  assetId: RestakeAssetId;
  assetSymbol: string;
  sessionsRemaining: number;
  sessionDurationMs: number;
};

const COLUMN_HELPER = createColumnHelper<WithdrawRequestTableRow>();

const COLUMNS = [
  COLUMN_HELPER.accessor('assetId', {
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
  COLUMN_HELPER.accessor('amount', {
    header: () => <TableCell>Amount</TableCell>,
    cell: (props) => (
      <TableCell fw="normal" className="text-mono-200 dark:text-mono-0">
        {props.getValue()} {props.row.original.assetSymbol}
      </TableCell>
    ),
  }),
  COLUMN_HELPER.accessor('sessionsRemaining', {
    header: () => 'Time Remaining',
    sortingFn: (a, b) =>
      a.original.sessionsRemaining - b.original.sessionsRemaining,
    cell: (props) => {
      const sessionsRemaining = props.getValue();

      if (sessionsRemaining <= 0) {
        return (
          <Typography
            variant="body2"
            className="flex items-center gap-1 text-mono-200 dark:text-mono-0"
          >
            <CheckboxCircleFill className="fill-green-50 dark:fill-green-50" />
            Ready
          </Typography>
        );
      }

      const timeRemaining = formatSessionDistance(
        sessionsRemaining,
        props.row.original.sessionDurationMs,
      );

      return (
        <Typography variant="body2" className="flex items-center gap-1">
          <TimeFillIcon className="fill-blue-50 dark:fill-blue-50" />

          {timeRemaining}
        </Typography>
      );
    },
  }),
];

type Props = {
  withdrawRequests: DelegatorWithdrawRequest[];
};

const WithdrawRequestTable: FC<Props> = ({ withdrawRequests }) => {
  const { vaults } = useRestakeContext();
  const { leaveDelegatorsDelay } = useRestakeConsts();
  const { result: currentRound } = useRestakeCurrentRound();
  const sessionDurationMs = useSessionDurationMs();

  const requests = useMemo(() => {
    // Not yet ready.
    if (currentRound === null || sessionDurationMs === null) {
      return [];
    }

    return withdrawRequests.flatMap(({ assetId, amount, requestedRound }) => {
      const metadata = isEvmAddress(assetId)
        ? findErc20Token(assetId)
        : vaults[assetId];

      // Skip requests that are lacking metadata.
      if (metadata === undefined || metadata === null) {
        return [];
      }

      const fmtAmount = formatDisplayAmount(
        new BN(amount.toString()),
        metadata.decimals,
        AmountFormatStyle.SHORT,
      );

      const sessionsRemaining = calculateTimeRemaining(
        currentRound,
        requestedRound,
        leaveDelegatorsDelay,
      );

      return {
        amount: fmtAmount,
        amountRaw: amount,
        assetId,
        assetSymbol: metadata.symbol,
        sessionsRemaining,
        sessionDurationMs,
      } satisfies WithdrawRequestTableRow;
    });
  }, [
    currentRound,
    sessionDurationMs,
    withdrawRequests,
    vaults,
    leaveDelegatorsDelay,
  ]);

  const table = useReactTable(
    useMemo<TableOptions<WithdrawRequestTableRow>>(
      () => ({
        data: requests,
        columns: COLUMNS,
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
      [requests],
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
        title={pluralize('request', requests.length !== 1)}
      />

      <WithdrawRequestTableActions
        allRequests={requests}
        selectedRequests={selectedRequests}
      />
    </>
  );
};

export default WithdrawRequestTable;
