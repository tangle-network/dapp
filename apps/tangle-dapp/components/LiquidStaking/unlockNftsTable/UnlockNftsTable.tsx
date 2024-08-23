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
import { FC, ReactNode, useMemo } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { LsErc20TokenId } from '../../../constants/liquidStaking/types';
import useLiquifierNftUnlocks, {
  LiquifierUnlockNft,
} from '../../../data/liquifier/useLiquifierNftUnlocks';
import useEvmAddress20 from '../../../hooks/useEvmAddress';
import addCommasToNumber from '../../../utils/addCommasToNumber';
import GlassCard from '../../GlassCard';
import { HeaderCell } from '../../tableCells';
import TokenAmountCell from '../../tableCells/TokenAmountCell';
import ExternalLink from '../ExternalLink';
import TableRowsSkeleton from '../TableRowsSkeleton';

const columnHelper = createColumnHelper<LiquifierUnlockNft>();

const columns = [
  columnHelper.accessor('unlockId', {
    header: () => <HeaderCell title="Unlock ID" className="justify-start" />,
    cell: (props) => {
      return (
        <div className="flex items-center justify-start gap-2">
          <CheckBox
            isChecked={props.row.getIsSelected()}
            isDisabled={!props.row.getCanSelect()}
            onChange={props.row.getToggleSelectedHandler()}
            wrapperClassName="pt-0.5 flex items-center justify-center"
          />

          {addCommasToNumber(props.getValue())}
        </div>
      );
    },
  }),
  columnHelper.accessor('progress', {
    header: () => <HeaderCell title="Progress" className="justify-center" />,
    cell: (props) => {
      const progress = props.getValue();

      const progressString = (() => {
        if (progress === 100) {
          return undefined;
        }

        return progress.toFixed(2) + '%';
      })();

      const content =
        progressString === undefined ? (
          <CheckboxCircleFill className="dark:fill-green-50" />
        ) : (
          <div className="flex gap-1 items-center justify-center">
            <TimeFillIcon className="dark:fill-blue-50" /> {progressString}
          </div>
        );

      return <div className="flex items-center justify-start">{content}</div>;
    },
  }),
  columnHelper.accessor('amount', {
    header: () => <HeaderCell title="Amount" className="justify-center" />,
    cell: (props) => {
      const unstakeRequest = props.row.original;

      return (
        <TokenAmountCell
          amount={props.getValue()}
          tokenSymbol={unstakeRequest.symbol}
          decimals={props.row.original.decimals}
          className="text-left"
        />
      );
    },
  }),
  // TODO: Name, validator, and maturity date (time left) columns. Also add an info icon tooltip for the maturity date to show the exact unlock date on hover.
];

type UnlockNftsTableProps = {
  tokenId: LsErc20TokenId;
};

const UnlockNftsTable: FC<UnlockNftsTableProps> = ({ tokenId }) => {
  const evmAddress20 = useEvmAddress20();
  const rows = useLiquifierNftUnlocks(tokenId);

  const tableOptions = useMemo<TableOptions<LiquifierUnlockNft>>(
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
    if (evmAddress20 === null) {
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

      return request.progress === 100;
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
            {/* TODO: Add the rebond and withdraw buttons. */}
            {/* <RebondLstUnstakeRequestButton
              // Can only rebond if there are selected rows.
              isDisabled={selectedRowsUnlockIds.size === 0}
              currenciesAndUnlockIds={currenciesAndUnlockIds}
            />

            <WithdrawLstUnstakeRequestButton
              canWithdraw={canWithdrawAllSelected}
              currenciesAndUnlockIds={currenciesAndUnlockIds}
            /> */}
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

export default React.memo(UnlockNftsTable);
