'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import BN from 'bn.js';
import { FC, useMemo } from 'react';

import useLstUnlockRequests from '../../../data/liquidStaking/useLstUnlockRequests';
import { AnySubstrateAddress } from '../../../types/utils';
import calculateTimeRemaining from '../../../utils/calculateTimeRemaining';
import GlassCard from '../../GlassCard';
import { HeaderCell } from '../../tableCells';
import TokenAmountCell from '../../tableCells/TokenAmountCell';
import AddressLink from '../AddressLink';
import CancelUnstakeModal from '../CancelUnstakeModal';
import ExternalLink from '../ExternalLink';
import RebondLstUnstakeRequestButton from './RebondLstUnstakeRequestButton';
import WithdrawLstUnstakeRequestButton from './WithdrawLstUnstakeRequestButton';

export type UnstakeRequestItem = {
  unlockId: number;
  address: AnySubstrateAddress;
  amount: BN;
  unlockTimestamp?: number;

  /**
   * Whether the unlocking period of this request has completed,
   * and the request is ready to be executed, and the tokens
   * withdrawn.
   */
  unlockDurationHasElapsed: boolean;
};

const columnHelper = createColumnHelper<UnstakeRequestItem>();

const columns = [
  columnHelper.accessor('address', {
    header: () => (
      <HeaderCell title="Unstake Request" className="justify-start" />
    ),
    cell: (props) => {
      return (
        <div className="flex items-center justify-start gap-2">
          <CheckBox
            isChecked={false}
            onChange={() => void 0}
            wrapperClassName="pt-0.5"
          />

          <AddressLink address={props.getValue()} />
        </div>
      );
    },
  }),
  columnHelper.accessor('unlockTimestamp', {
    header: () => <HeaderCell title="Status" className="justify-center" />,
    cell: (props) => {
      const endTimestamp = props.getValue();

      const timeRemaining =
        endTimestamp === undefined
          ? undefined
          : calculateTimeRemaining(new Date(endTimestamp));

      const content =
        timeRemaining === undefined ? (
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
      return <TokenAmountCell amount={props.getValue()} tokenSymbol="tgDOT" />;
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <HeaderCell title="Actions" className="justify-center" />,
    cell: (props) => {
      const unstakeRequest = props.row.original;

      return (
        <div className="flex items-center justify-center gap-1">
          <RebondLstUnstakeRequestButton
            canRebond={!unstakeRequest.unlockDurationHasElapsed}
            unlockId={unstakeRequest.unlockId}
          />

          <WithdrawLstUnstakeRequestButton
            canWithdraw={unstakeRequest.unlockDurationHasElapsed}
            unlockId={unstakeRequest.unlockId}
          />
        </div>
      );
    },
    enableSorting: false,
  }),
];

const UnstakeRequestsTable: FC = () => {
  const tokenUnlockLedger = useLstUnlockRequests();

  const data: UnstakeRequestItem[] = useMemo(() => {
    if (tokenUnlockLedger === null) {
      // TODO: Return null instead, and use skeleton loader if the data isn't ready.
      return [];
    }

    return tokenUnlockLedger
      .filter((entry) => {
        // Filter entries to include only those that are redeeming
        // into the native currency.
        return entry.currencyType === 'Native';
      })
      .map((entry) => ({
        unlockId: entry.unlockId,
        amount: entry.amount,
        // TODO: Calculate these properties properly. Currently using dummy data.
        endTimestamp: Date.now() + 1000 * 60 * 60 * 24,
        address:
          '0x1234567890abcdef1234567890abcdef123456789' as AnySubstrateAddress,
        unlockDurationHasElapsed: false,
      }));
  }, [tokenUnlockLedger]);

  const tableParams = useMemo(
    () => ({
      data,
      columns,
      filterFns: {
        fuzzy: fuzzyFilter,
      },
      globalFilterFn: fuzzyFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    }),
    [data],
  );

  const table = useReactTable(tableParams);

  return (
    <div className="space-y-4 flex-grow max-w-[700px]">
      <GlassCard>
        {data.length === 0 ? (
          <NoUnstakeRequestsNotice />
        ) : (
          <Table
            thClassName="!bg-inherit border-t-0 bg-mono-0 !px-3 !py-2 whitespace-nowrap"
            trClassName="!bg-inherit"
            tdClassName="!bg-inherit !px-3 !py-2 whitespace-nowrap"
            tableProps={table}
            totalRecords={data.length}
          />
        )}
      </GlassCard>

      {data.length === 0 && (
        <div className="flex items-center justify-end w-full">
          <ExternalLink Icon={ArrowRightUp} href={TANGLE_DOCS_URL}>
            View Docs
          </ExternalLink>
        </div>
      )}

      {/* TODO: Handle this modal properly. */}
      <CancelUnstakeModal
        isOpen={false}
        onClose={() => void 0}
        unstakeRequest={null as any}
      />
    </div>
  );
};

/** @internal */
const NoUnstakeRequestsNotice: FC = () => {
  return (
    <div className="flex flex-col items-start justify-center gap-4">
      <Typography className="dark:text-mono-0" variant="body1" fw="bold">
        No unstake requests
      </Typography>

      <Typography variant="body2" fw="normal">
        You will be able to claim your tokens after the unstake request has been
        processed. To unstake your tokens go to the unstake tab to schedule
        request.
      </Typography>
    </div>
  );
};

export default UnstakeRequestsTable;
