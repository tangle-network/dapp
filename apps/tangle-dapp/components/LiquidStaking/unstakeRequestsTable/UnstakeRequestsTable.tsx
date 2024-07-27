'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowRightUp,
  CheckboxCircleFill,
  TimeFillIcon,
} from '@webb-tools/icons';
import {
  CheckBox,
  fuzzyFilter,
  Table,
  TANGLE_DOCS_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import BN from 'bn.js';
import { FC, ReactNode, useMemo } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LST_PREFIX,
  ParachainCurrency,
  SimpleTimeUnitInstance,
} from '../../../constants/liquidStaking';
import useSubstrateAddress from '../../../hooks/useSubstrateAddress';
import { AnySubstrateAddress } from '../../../types/utils';
import calculateTimeRemaining from '../../../utils/calculateTimeRemaining';
import GlassCard from '../../GlassCard';
import { HeaderCell } from '../../tableCells';
import TokenAmountCell from '../../tableCells/TokenAmountCell';
import AddressLink from '../AddressLink';
import ExternalLink from '../ExternalLink';
import TableRowsSkeleton from '../TableRowsSkeleton';
import RebondLstUnstakeRequestButton from './RebondLstUnstakeRequestButton';
import useLstUnlockRequestTableRows from './useLstUnlockRequestTableRows';
import WithdrawLstUnstakeRequestButton from './WithdrawLstUnstakeRequestButton';

export type UnstakeRequestTableRow = {
  unlockId: number;
  address: AnySubstrateAddress;
  amount: BN;
  decimals: number;
  estimatedUnlockTimestamp?: number;
  unlockTimeUnit: SimpleTimeUnitInstance;
  currency: ParachainCurrency;

  /**
   * Whether the unlocking period of this request has completed,
   * and the request is ready to be executed, and the tokens
   * withdrawn.
   */
  hasUnlocked: boolean;
};

const columnHelper = createColumnHelper<UnstakeRequestTableRow>();

const columns = [
  columnHelper.accessor('address', {
    header: () => (
      <HeaderCell title="Unstake Request" className="justify-start" />
    ),
    cell: (props) => {
      return (
        <div className="flex items-center justify-start gap-2">
          <CheckBox
            isChecked={props.row.getIsSelected()}
            isDisabled={!props.row.getCanSelect()}
            onChange={props.row.getToggleSelectedHandler()}
            wrapperClassName="pt-0.5 flex items-center justify-center"
          />

          <AddressLink address={props.getValue()} />
        </div>
      );
    },
  }),
  columnHelper.accessor('estimatedUnlockTimestamp', {
    header: () => <HeaderCell title="Status" className="justify-center" />,
    cell: (props) => {
      const estimatedUnlockTimestamp = props.getValue();
      const unlockTimeUnit = props.row.original.unlockTimeUnit;
      const unit = unlockTimeUnit.unit.toLowerCase();
      const plurality = unlockTimeUnit.value > 1 ? 's' : '';

      const timeRemaining =
        estimatedUnlockTimestamp === undefined
          ? `${unlockTimeUnit.value} ${unit}${plurality}`
          : calculateTimeRemaining(new Date(estimatedUnlockTimestamp));

      const content = props.row.original.hasUnlocked ? (
        <CheckboxCircleFill className="dark:fill-green-50" />
      ) : (
        <div className="flex gap-1 items-center justify-center">
          <TimeFillIcon className="dark:fill-blue-50" /> {timeRemaining}
        </div>
      );

      return <div className="flex items-center justify-center">{content}</div>;
    },
  }),
  columnHelper.accessor('amount', {
    header: () => <HeaderCell title="Amount" className="justify-center" />,
    cell: (props) => {
      const unstakeRequest = props.row.original;
      const tokenSymbol = `${LST_PREFIX}${unstakeRequest.currency.toUpperCase()}`;

      return (
        <TokenAmountCell
          amount={props.getValue()}
          tokenSymbol={tokenSymbol}
          decimals={props.row.original.decimals}
        />
      );
    },
  }),
];

const UnstakeRequestsTable: FC = () => {
  const substrateAddress = useSubstrateAddress();
  const rows = useLstUnlockRequestTableRows();

  const tableOptions = useMemo<TableOptions<UnstakeRequestTableRow>>(
    () => ({
      // In case that the data is not loaded yet, use an empty array
      // to avoid TypeScript errors.
      data: rows ?? [],
      columns,
      filterFns: {
        fuzzy: fuzzyFilter,
      },
      // getRowId: (row) => row.unlockId.toString(),
      globalFilterFn: fuzzyFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableRowSelection: true,
    }),
    [rows],
  );

  const tableProps = useReactTable(tableOptions);

  const selectedRowsUnlockIds = useMemo<Set<number>>(
    () => {
      console.debug('changed');

      const selectedRows = tableProps
        .getSelectedRowModel()
        .rows.map((row) => row.original.unlockId);

      return new Set(selectedRows);
    },

    // TODO: Get this bug fixed: For some reason, the `tableProps` object will not trigger a re-render when the selected rows change. This is a workaround to force a re-render. This might be because the object itself is not changing, only the contents of the object are changing?
    [tableProps, tableProps.getSelectedRowModel().rows],
  );

  // Note that memoizing this will cause the table to not update
  // when the selected rows change.
  const table = (() => {
    // No account connected.
    if (substrateAddress === null) {
      return (
        <Notice
          title="No account connected"
          content="Once an account is connected, you will be able to see information about your unstake requests, including the amount, status, and actions you can take."
        />
      );
    }
    // Data still loading.
    else if (rows === null) {
      return (
        <Notice
          title="Unstake requests"
          content={<TableRowsSkeleton rowCount={5} />}
        />
      );
    }
    // No unstake requests.
    else if (rows.length === 0) {
      return (
        <Notice
          title="No unstake requests"
          content="You will be able to claim your tokens after the unstake request has been processed. To unstake your tokens go to the unstake tab to schedule request."
        />
      );
    }

    return (
      <Table
        thClassName="!bg-inherit border-t-0 bg-mono-0 !px-3 !py-2 whitespace-nowrap"
        trClassName="!bg-inherit"
        tdClassName="!bg-inherit !px-3 !py-2 whitespace-nowrap"
        tableProps={tableProps}
        totalRecords={rows.length}
      />
    );
  })();

  // Can only withdraw all selected unstake requests if they
  // have all completed their unlocking period.
  const canWithdrawAllSelected = useMemo(() => {
    // No rows selected or not loaded yet.
    if (selectedRowsUnlockIds.size === 0 || rows === null) {
      return false;
    }

    const unlockIds = Array.from(selectedRowsUnlockIds);

    // Check that all selected rows have completed their unlocking
    // period.
    return unlockIds.every((unlockId) => {
      const request = rows.find((request) => request.unlockId === unlockId);

      assert(
        request !== undefined,
        'All unlock ids should have a corresponding request',
      );

      return request.hasUnlocked;
    });
  }, [selectedRowsUnlockIds, rows]);

  return (
    <div className="space-y-4 flex-grow max-w-[700px]">
      <GlassCard
        className={twMerge(
          rows !== null &&
            rows.length > 0 &&
            'flex flex-col justify-between min-h-[500px]',
        )}
      >
        {table}

        {rows !== null && rows.length > 0 && (
          <div className="flex gap-3 items-center justify-center">
            <RebondLstUnstakeRequestButton
              // Can only rebond if there are selected rows.
              isDisabled={selectedRowsUnlockIds.size === 0}
              unlockIds={selectedRowsUnlockIds}
            />

            <WithdrawLstUnstakeRequestButton
              canWithdraw={canWithdrawAllSelected}
              unlockIds={selectedRowsUnlockIds}
            />
          </div>
        )}
      </GlassCard>

      {rows !== null && rows.length === 0 && (
        <div className="flex items-center justify-end w-full">
          <ExternalLink Icon={ArrowRightUp} href={TANGLE_DOCS_URL}>
            View Docs
          </ExternalLink>
        </div>
      )}
    </div>
  );
};

type NoticeProps = {
  title: string;
  content: string | ReactNode;
};

/** @internal */
const Notice: FC<NoticeProps> = ({ title, content }) => {
  return (
    <div className="flex flex-col items-start justify-center gap-4">
      <Typography className="dark:text-mono-0" variant="body1" fw="bold">
        {title}
      </Typography>

      {typeof content === 'string' ? (
        <Typography variant="body2" fw="normal">
          {content}
        </Typography>
      ) : (
        content
      )}
    </div>
  );
};

export default React.memo(UnstakeRequestsTable);
