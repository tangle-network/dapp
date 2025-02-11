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
import type { DelegatorUnstakeRequest } from '@webb-tools/tangle-shared-ui/types/restake';
import type { IdentityType } from '@webb-tools/tangle-shared-ui/utils/polkadot/identity';
import {
  AmountFormatStyle,
  formatDisplayAmount,
  isEvmAddress,
  Typography,
} from '@webb-tools/webb-ui-components';
import { CheckBox } from '@webb-tools/webb-ui-components/components/CheckBox';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { FC, useMemo } from 'react';
import AvatarWithText from '../../components/AvatarWithText';
import useRestakeConsts from '../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../data/restake/useRestakeCurrentRound';
import TableCell from '../../components/restaking/TableCell';
import { calculateTimeRemaining } from '../../pages/restake/utils';
import UnstakeRequestTableActions from './UnstakeRequestTableActions';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { BN } from '@polkadot/util';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import useSessionDurationMs from '../../data/useSessionDurationMs';
import formatSessionDistance from '../../utils/formatSessionDistance';

export type UnstakeRequestTableRow = {
  amount: string;
  amountRaw: bigint;
  assetId: RestakeAssetId;
  assetSymbol: string;
  sessionsRemaining: number;
  sessionDurationMs: number;
  operatorAccountId: SubstrateAddress;
  operatorIdentityName?: string;
};

const COLUMN_HELPER = createColumnHelper<UnstakeRequestTableRow>();

const COLUMNS = [
  COLUMN_HELPER.accessor('operatorAccountId', {
    id: 'select',
    enableSorting: false,
    header: () => <TableCell>Operator</TableCell>,
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

      if (sessionsRemaining <= 0) {
        return (
          <Typography variant="body2" className="flex items-center gap-1">
            <CheckboxCircleFill className="!fill-green-50" />
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
  unstakeRequests: DelegatorUnstakeRequest[];
  operatorIdentities: Record<string, IdentityType | null>;
};

const UnstakeRequestTable: FC<Props> = ({
  unstakeRequests,
  operatorIdentities,
}) => {
  const { assets } = useRestakeContext();
  const { delegationBondLessDelay } = useRestakeConsts();
  const { result: currentRound } = useRestakeCurrentRound();
  const sessionDurationMs = useSessionDurationMs();

  const requests = useMemo<UnstakeRequestTableRow[]>(() => {
    // Not yet ready.
    if (currentRound === null || sessionDurationMs == null) {
      return [];
    }

    return unstakeRequests.flatMap(
      ({ assetId, amount, requestedRound, operatorAccountId }) => {
        const metadata = assets[assetId];

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
          delegationBondLessDelay,
        );

        return {
          amount: fmtAmount,
          amountRaw: amount,
          assetId: assetId,
          assetSymbol: metadata.symbol,
          sessionsRemaining,
          sessionDurationMs,
          operatorAccountId,
          operatorIdentityName:
            operatorIdentities?.[operatorAccountId]?.name ?? undefined,
        } satisfies UnstakeRequestTableRow;
      },
    );
  }, [
    currentRound,
    sessionDurationMs,
    unstakeRequests,
    assets,
    delegationBondLessDelay,
    operatorIdentities,
  ]);

  const table = useReactTable(
    useMemo<TableOptions<UnstakeRequestTableRow>>(
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

      <UnstakeRequestTableActions
        allRequests={requests}
        selectedRequests={selectedRequests}
      />
    </>
  );
};

export default UnstakeRequestTable;
