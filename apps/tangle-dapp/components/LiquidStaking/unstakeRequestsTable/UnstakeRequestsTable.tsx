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
  ParachainCurrency,
  SimpleTimeUnitInstance,
} from '../../../constants/liquidStaking';
import useSubstrateAddress from '../../../hooks/useSubstrateAddress';
import { AnySubstrateAddress } from '../../../types/utils';
import stringifyTimeUnit from '../../../utils/liquidStaking/stringifyTimeUnit';
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
  currency: ParachainCurrency;

  /**
   * How many time units are remaining until the request is
   * unlocked.
   *
   * If this is undefined, it means that the request has
   * completed its unlocking period.
   */
  remainingTimeUnit?: SimpleTimeUnitInstance;
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
  columnHelper.accessor('remainingTimeUnit', {
    header: () => <HeaderCell title="Status" className="justify-center" />,
    cell: (props) => {
      const remainingTimeUnit = props.getValue();

      const remainingString = (() => {
        if (remainingTimeUnit === undefined) {
          return undefined;
        }

        return stringifyTimeUnit(remainingTimeUnit).join(' ');
      })();

      const content =
        remainingString === undefined ? (
          <CheckboxCircleFill className="dark:fill-green-50" />
        ) : (
          <div className="flex gap-1 items-center justify-center">
            <TimeFillIcon className="dark:fill-blue-50" /> {remainingString}
          </div>
        );

      return <div className="flex items-center justify-start">{content}</div>;
    },
  }),
  columnHelper.accessor('amount', {
    header: () => <HeaderCell title="Amount" className="justify-center" />,
    cell: (props) => {
      const unstakeRequest = props.row.original;
      const tokenSymbol = unstakeRequest.currency.toUpperCase();

      return (
        <TokenAmountCell
          amount={props.getValue()}
          tokenSymbol={tokenSymbol}
          decimals={props.row.original.decimals}
          className="text-left"
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
  const tablePropsRows = tableProps.getSelectedRowModel().rows;

  const selectedRowsUnlockIds = useMemo<Set<number>>(() => {
    const selectedRows = tablePropsRows.map((row) => row.original.unlockId);

    return new Set(selectedRows);
  }, [tablePropsRows]);

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
          content="You will be able to withdraw your tokens after the unstake request has been processed. Schedule an unstake request to get started."
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

      // If the remaining time unit is undefined, it means that the
      // request has completed its unlocking period.
      return request.remainingTimeUnit === undefined;
    });
  }, [selectedRowsUnlockIds, rows]);

  const currenciesAndUnlockIds = useMemo<[ParachainCurrency, number][]>(() => {
    return tablePropsRows.map((row) => {
      const { currency, unlockId } = row.original;

      return [currency, unlockId];
    });
  }, [tablePropsRows]);

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
              currenciesAndUnlockIds={currenciesAndUnlockIds}
            />

            <WithdrawLstUnstakeRequestButton
              canWithdraw={canWithdrawAllSelected}
              currenciesAndUnlockIds={currenciesAndUnlockIds}
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
