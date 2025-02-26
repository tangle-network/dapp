import { BN } from '@polkadot/util';
import { CheckboxCircleFill } from '@tangle-network/icons/CheckboxCircleFill';
import { TimeFillIcon } from '@tangle-network/icons/TimeFillIcon';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import type { DelegatorWithdrawRequest } from '@tangle-network/tangle-shared-ui/types/restake';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';
import { fuzzyFilter } from '@tangle-network/ui-components/components/Filter/utils';
import { Table } from '@tangle-network/ui-components/components/Table';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo } from 'react';
import TableCell from '../../components/restaking/TableCell';
import useRestakeConsts from '../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../data/restake/useRestakeCurrentRound';
import useSessionDurationMs from '../../data/useSessionDurationMs';
import { calculateTimeRemaining } from '../../pages/restake/utils';
import formatSessionDistance from '../../utils/formatSessionDistance';
import WithdrawRequestTableActions from './WithdrawRequestTableActions';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';

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
    header: () => <TableCell>Amount</TableCell>,
    cell: (props) => (
      <div className="flex items-center justify-start gap-2">
        <CheckBox
          isChecked={props.row.getIsSelected()}
          isDisabled={!props.row.getCanSelect()}
          onChange={props.row.getToggleSelectedHandler()}
          wrapperClassName="pt-0.5 flex items-center justify-center"
        />

        <Typography variant="body1">
          {props.row.original.amount} {props.row.original.assetSymbol}
        </Typography>
      </div>
    ),
  }),
  COLUMN_HELPER.accessor('sessionsRemaining', {
    header: () => <TableCell>Time Remaining</TableCell>,
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
  const assets = useRestakeAssets();
  const { leaveDelegatorsDelay } = useRestakeConsts();
  const { result: currentRound } = useRestakeCurrentRound();
  const sessionDurationMs = useSessionDurationMs();

  const requests = useMemo(() => {
    // Not yet ready.
    if (
      currentRound === null ||
      sessionDurationMs === null ||
      assets === null
    ) {
      return [];
    }

    return withdrawRequests.flatMap(({ assetId, amount, requestedRound }) => {
      const asset = assets.get(assetId);

      // Skip requests that are lacking metadata.
      if (asset === undefined || asset === null) {
        return [];
      }

      const fmtAmount = formatDisplayAmount(
        new BN(amount.toString()),
        asset.metadata.decimals,
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
        assetSymbol: asset.metadata.symbol,
        sessionsRemaining,
        sessionDurationMs,
      } satisfies WithdrawRequestTableRow;
    });
  }, [
    currentRound,
    sessionDurationMs,
    withdrawRequests,
    assets,
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
