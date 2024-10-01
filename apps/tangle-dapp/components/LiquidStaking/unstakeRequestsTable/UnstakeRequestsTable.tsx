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
  LsParachainSimpleTimeUnit,
  ParachainCurrency,
} from '../../../constants/liquidStaking/types';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useLiquifierNftUnlocks, {
  LiquifierUnlockNftMetadata,
} from '../../../data/liquifier/useLiquifierNftUnlocks';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import addCommasToNumber from '../../../utils/addCommasToNumber';
import isLiquifierProtocolId from '../../../utils/liquidStaking/isLiquifierProtocolId';
import isLsParachainChainId from '../../../utils/liquidStaking/isLsParachainChainId';
import stringifyTimeUnit from '../../../utils/liquidStaking/stringifyTimeUnit';
import GlassCard from '../../GlassCard';
import { HeaderCell } from '../../tableCells';
import TokenAmountCell from '../../tableCells/TokenAmountCell';
import ExternalLink from '../ExternalLink';
import TableRowsSkeleton from '../TableRowsSkeleton';
import RebondLstUnstakeRequestButton from './RebondLstUnstakeRequestButton';
import useLstUnlockRequestTableRows from './useLstUnlockRequestTableRows';
import WithdrawLstUnstakeRequestButton from './WithdrawLstUnstakeRequestButton';
import WithdrawUnlockNftButton from './WithdrawUnlockNftButton';

export type BaseUnstakeRequest = {
  unlockId: number;
  decimals: number;

  /**
   * The underlying stake tokens amount represented by the unlock
   * request.
   */
  amount: BN;
};

export type ParachainUnstakeRequest = BaseUnstakeRequest & {
  type: 'parachainUnstakeRequest';
  currency: ParachainCurrency;

  /**
   * How many time units are remaining until the request is
   * unlocked.
   *
   * If this is undefined, it means that the request has
   * completed its unlocking period.
   */
  progress?: LsParachainSimpleTimeUnit;
};

type UnstakeRequestTableRow =
  | LiquifierUnlockNftMetadata
  | ParachainUnstakeRequest;

const COLUMN_HELPER = createColumnHelper<UnstakeRequestTableRow>();

const COLUMNS = [
  COLUMN_HELPER.accessor('unlockId', {
    header: () => <HeaderCell title="Unlock ID" className="justify-start" />,
    cell: (props) => {
      const canSelect =
        props.row.original.type === 'liquifierUnlockNft'
          ? props.row.original.progress === 1
          : true;

      return (
        <div className="flex items-center justify-start gap-2">
          <CheckBox
            isChecked={props.row.getIsSelected()}
            isDisabled={!props.row.getCanSelect() || !canSelect}
            onChange={props.row.getToggleSelectedHandler()}
            wrapperClassName="pt-0.5 flex items-center justify-center"
          />
          #{addCommasToNumber(props.getValue())}
        </div>
      );
    },
  }),
  COLUMN_HELPER.accessor('progress', {
    header: () => <HeaderCell title="Status" className="justify-center" />,
    cell: (props) => {
      const progress = props.getValue();

      const progressString = (() => {
        if (progress === undefined) {
          return undefined;
        }
        // If it's a number (percentage) representing an unlock NFT's
        // unlocking progress, convert it to a string.
        else if (typeof progress === 'number') {
          if (progress === 1) {
            return undefined;
          }

          return (progress * 100).toFixed(2) + '%';
        }
        // Otherwise, it must be a Parachain unstake request's
        // remaining time unit.
        else {
          return stringifyTimeUnit(progress).join(' ');
        }
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
  COLUMN_HELPER.accessor('amount', {
    header: () => <HeaderCell title="Amount" className="justify-center" />,
    cell: (props) => {
      const unstakeRequest = props.row.original;

      const tokenSymbol =
        unstakeRequest.type === 'parachainUnstakeRequest'
          ? unstakeRequest.currency.toUpperCase()
          : unstakeRequest.symbol;

      return (
        <TokenAmountCell
          amount={props.getValue()}
          symbol={tokenSymbol}
          decimals={props.row.original.decimals}
        />
      );
    },
    // TODO: Name, validator, and maturity date (time left) columns. Also add an info icon tooltip for the maturity date to show the exact unlock date on hover.
  }),
];

const UnstakeRequestsTable: FC = () => {
  const { selectedProtocolId } = useLsStore();
  const activeAccountAddress = useActiveAccountAddress();
  const parachainRows = useLstUnlockRequestTableRows();
  const liquifierRows = useLiquifierNftUnlocks();

  // Select the table rows based on whether the selected protocol
  // is an EVM-based chain (liquifier contract) or a parachain-based
  // Substrate chain.
  const rows = isLiquifierProtocolId(selectedProtocolId)
    ? liquifierRows
    : parachainRows;

  const tableOptions = useMemo<TableOptions<UnstakeRequestTableRow>>(
    () => ({
      // In case that the data is not loaded yet, use an empty array
      // to avoid TypeScript errors.
      data: rows ?? [],
      columns: COLUMNS,
      filterFns: {
        fuzzy: fuzzyFilter,
      },
      globalFilterFn: fuzzyFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableRowSelection: true,
      autoResetPageIndex: false,
      getRowId: (row) => row.unlockId.toString(),
    }),
    [rows],
  );

  const tableProps = useReactTable(tableOptions);
  const selectedRows = tableProps.getSelectedRowModel().rows;

  const selectedRowsUnlockIds = useMemo<Set<number>>(() => {
    const selectedRowsIds = selectedRows.map((row) => row.original.unlockId);

    return new Set(selectedRowsIds);
  }, [selectedRows]);

  // Note that memoizing this will cause the table to not update
  // when the selected rows change.
  const table = (() => {
    // No account connected.
    if (activeAccountAddress === null) {
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
        isPaginated
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
      return request.type === 'parachainUnstakeRequest'
        ? request.progress === undefined
        : request.progress === 1;
    });
  }, [selectedRowsUnlockIds, rows]);

  const parachainCurrenciesAndUnlockIds = useMemo<
    [ParachainCurrency, number][]
  >(() => {
    return selectedRows.flatMap((row) => {
      if (row.original.type !== 'parachainUnstakeRequest') {
        return [];
      }

      return [[row.original.currency, row.original.unlockId]];
    });
  }, [selectedRows]);

  const nftUnlockIds = useMemo<number[]>(() => {
    return selectedRows.flatMap((row) => {
      if (row.original.type !== 'liquifierUnlockNft') {
        return [];
      }

      return [row.original.unlockId];
    });
  }, [selectedRows]);

  const isDataState =
    rows !== null && rows.length > 0 && activeAccountAddress !== null;

  return (
    <div className="space-y-4 flex-grow max-w-[700px]">
      <GlassCard
        className={twMerge(
          isDataState && 'flex flex-col justify-between min-h-[500px]',
        )}
      >
        {table}

        {isDataState && (
          <div className="flex gap-3 items-center justify-center">
            {isLsParachainChainId(selectedProtocolId) && (
              <RebondLstUnstakeRequestButton
                // Can only rebond if there are selected rows.
                isDisabled={selectedRowsUnlockIds.size === 0}
                currenciesAndUnlockIds={parachainCurrenciesAndUnlockIds}
              />
            )}

            {/* TODO: Assert that the id is either parachain or liquifier, if it isn't then we might need to hide this unstake requests table and show a specific one for Tangle networks (LS pools). */}
            {isLsParachainChainId(selectedProtocolId) ? (
              <WithdrawLstUnstakeRequestButton
                canWithdraw={canWithdrawAllSelected}
                currenciesAndUnlockIds={parachainCurrenciesAndUnlockIds}
              />
            ) : isLiquifierProtocolId(selectedProtocolId) ? (
              <WithdrawUnlockNftButton
                tokenId={selectedProtocolId}
                canWithdraw={canWithdrawAllSelected}
                unlockIds={nftUnlockIds}
              />
            ) : undefined}
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
