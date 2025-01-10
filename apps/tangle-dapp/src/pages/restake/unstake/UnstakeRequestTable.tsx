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
import type {
  AssetMetadata,
  DelegatorUnstakeRequest,
} from '@webb-tools/tangle-shared-ui/types/restake';
import type { IdentityType } from '@webb-tools/tangle-shared-ui/utils/polkadot/identity';
import {
  AmountFormatStyle,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
} from '@webb-tools/webb-ui-components';
import { CheckBox } from '@webb-tools/webb-ui-components/components/CheckBox';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { FC, useMemo } from 'react';
import AvatarWithText from '../../../components/AvatarWithText';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeCurrentRound from '../../../data/restake/useRestakeCurrentRound';
import TableCell from '../TableCell';
import { calculateTimeRemaining } from '../utils';
import UnstakeRequestTableActions from './UnstakeRequestTableActions';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { BN } from '@polkadot/util';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

export type UnstakeRequestTableRow = {
  amount: string;
  amountRaw: bigint;
  assetId: string;
  assetSymbol: string;
  timeRemaining: number;
  operatorAccountId: SubstrateAddress;
  operatorIdentityName?: string;
};

const COLUMN_HELPER = createColumnHelper<UnstakeRequestTableRow>();

const COLUMNS = [
  COLUMN_HELPER.accessor('operatorAccountId', {
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
  COLUMN_HELPER.accessor('timeRemaining', {
    header: () => <TableCell>Time Remaining</TableCell>,
    sortingFn: (a, b) => a.original.timeRemaining - b.original.timeRemaining,
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
            EMPTY_VALUE_PLACEHOLDER
          ) : (
            <span className="flex items-center gap-1">
              <TimeFillIcon className="fill-blue-50 dark:fill-blue-50" />
              {`${value} session${value > 1 ? 's' : ''}`}
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

const createRowId = ({
  assetId,
  operatorAccountId,
}: {
  assetId: string;
  operatorAccountId: SubstrateAddress;
}): `${SubstrateAddress}-${string}` => {
  return `${operatorAccountId}-${assetId}`;
};

const UnstakeRequestTable: FC<Props> = ({
  unstakeRequests,
  operatorIdentities,
}) => {
  const { assetMap } = useRestakeContext();
  const { delegationBondLessDelay } = useRestakeConsts();
  const { currentRound } = useRestakeCurrentRound();

  const requests = useMemo<UnstakeRequestTableRow[]>(
    () =>
      unstakeRequests.flatMap(
        ({ assetId, amount, requestedRound, operatorAccountId }) => {
          const metadata: AssetMetadata | undefined = assetMap[assetId];

          // Ignore entries without metadata.
          if (!metadata) {
            return [];
          }

          const fmtAmount = formatDisplayAmount(
            new BN(amount.toString()),
            metadata.decimals,
            AmountFormatStyle.SHORT,
          );

          const timeRemaining = calculateTimeRemaining(
            currentRound,
            requestedRound,
            delegationBondLessDelay,
          );

          return {
            amount: fmtAmount,
            amountRaw: amount,
            assetId: assetId,
            assetSymbol: metadata.symbol,
            timeRemaining,
            operatorAccountId,
            operatorIdentityName:
              operatorIdentities?.[operatorAccountId]?.name ?? undefined,
          } satisfies UnstakeRequestTableRow;
        },
      ),
    [
      assetMap,
      currentRound,
      delegationBondLessDelay,
      operatorIdentities,
      unstakeRequests,
    ],
  );

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
        getRowId: createRowId,
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

      <div className="grid grid-cols-2 gap-3">
        <UnstakeRequestTableActions
          allRequests={requests}
          selectedRequests={selectedRequests}
        />
      </div>
    </>
  );
};

export default UnstakeRequestTable;
