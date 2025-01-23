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
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC, useMemo } from 'react';
import useRestakeConsts from '../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../data/restake/useRestakeCurrentRound';
import TableCell from '../../components/restaking/TableCell';
import { calculateTimeRemaining } from '../../pages/restake/utils';
import WithdrawRequestTableActions from './WithdrawRequestTableActions';
import {
  AmountFormatStyle,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  isEvmAddress,
} from '@webb-tools/webb-ui-components';
import { BN } from '@polkadot/util';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import { findErc20Token } from '../../data/restake/useTangleEvmErc20Balances';

export type WithdrawRequestTableRow = {
  amount: string;
  amountRaw: bigint;
  assetId: RestakeAssetId;
  assetSymbol: string;
  sessionsRemaining: number;
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
    header: () => <TableCell>Time Remaining</TableCell>,
    sortingFn: (a, b) =>
      a.original.sessionsRemaining - b.original.sessionsRemaining,
    cell: (props) => {
      const sessionsRemaining = props.getValue();

      return (
        <TableCell fw="normal" className="text-mono-200 dark:text-mono-0">
          {sessionsRemaining === 0 ? (
            <span className="flex items-center gap-1">
              <CheckboxCircleFill className="fill-green-50 dark:fill-green-50" />
              Ready
            </span>
          ) : sessionsRemaining < 0 ? (
            EMPTY_VALUE_PLACEHOLDER
          ) : (
            <span className="flex items-center gap-1">
              <TimeFillIcon className="fill-blue-50 dark:fill-blue-50" />

              {`${sessionsRemaining} ${pluralize('session', sessionsRemaining !== 1)}`}
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

const WithdrawRequestTable: FC<Props> = ({ withdrawRequests }) => {
  const { assetMetadataMap } = useRestakeContext();
  const { leaveDelegatorsDelay } = useRestakeConsts();
  const { result: currentRound } = useRestakeCurrentRound();

  const requests = useMemo(() => {
    // Not yet ready.
    if (currentRound === null) {
      return [];
    }

    return withdrawRequests.flatMap(({ assetId, amount, requestedRound }) => {
      const metadata = isEvmAddress(assetId)
        ? findErc20Token(assetId)
        : assetMetadataMap[assetId];

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
      } satisfies WithdrawRequestTableRow;
    });
  }, [assetMetadataMap, currentRound, leaveDelegatorsDelay, withdrawRequests]);

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
