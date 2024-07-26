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
import { FC, ReactNode, useMemo, useState } from 'react';

import {
  LST_PREFIX,
  ParachainCurrency,
} from '../../../constants/liquidStaking';
import useLstUnlockRequests from '../../../data/liquidStaking/useLstUnlockRequests';
import useSubstrateAddress from '../../../hooks/useSubstrateAddress';
import { AnySubstrateAddress } from '../../../types/utils';
import calculateTimeRemaining from '../../../utils/calculateTimeRemaining';
import GlassCard from '../../GlassCard';
import { HeaderCell } from '../../tableCells';
import TokenAmountCell from '../../tableCells/TokenAmountCell';
import AddressLink from '../AddressLink';
import ExternalLink from '../ExternalLink';
import SkeletonLoaderSet from '../SkeletonLoaderSet';
import RebondLstUnstakeRequestButton from './RebondLstUnstakeRequestButton';
import WithdrawLstUnstakeRequestButton from './WithdrawLstUnstakeRequestButton';

export type UnstakeRequestItem = {
  unlockId: number;
  address: AnySubstrateAddress;
  amount: BN;
  unlockTimestamp?: number;
  currency: ParachainCurrency;

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
      const unlockTimestamp = props.getValue();

      const timeRemaining =
        unlockTimestamp === undefined
          ? undefined
          : calculateTimeRemaining(new Date(unlockTimestamp));

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
      const unstakeRequest = props.row.original;
      const tokenSymbol = `${LST_PREFIX}${unstakeRequest.currency.toUpperCase()}`;

      return (
        <TokenAmountCell amount={props.getValue()} tokenSymbol={tokenSymbol} />
      );
    },
  }),
];

const UnstakeRequestsTable: FC = () => {
  const [selectedRowsUnlockIds, setSelectedRowsUnlockIds] = useState<
    Set<number>
  >(new Set());

  const substrateAddress = useSubstrateAddress();
  const tokenUnlockLedger = useLstUnlockRequests();

  const data = useMemo<UnstakeRequestItem[] | null>(() => {
    // Data not loaded yet.
    if (tokenUnlockLedger === null) {
      return null;
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
        currency: entry.currency,
      }));
  }, [tokenUnlockLedger]);

  const tableParams = useMemo(
    () => ({
      // In case that the data is not loaded yet, use an empty array
      // to avoid TypeScript errors.
      data: data ?? [],
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

  const tableProps = useReactTable(tableParams);

  const table = useMemo(() => {
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
    else if (data === null) {
      return (
        <Notice
          title="Unstake requests"
          content={<SkeletonLoaderSet count={5} />}
        />
      );
    }
    // No unstake requests.
    else if (data.length === 0) {
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
        totalRecords={data.length}
      />
    );
  }, [data, substrateAddress, tableProps]);

  // TODO: Compute this.
  const canRebondAllSelected = useMemo(() => {
    return true;
  }, []);

  // TODO: Compute this.
  const canWithdrawAllSelected = useMemo(() => {
    return true;
  }, []);

  return (
    <div className="space-y-4 flex-grow max-w-[700px]">
      <GlassCard>
        {table}

        <div className="flex gap-3 items-center justify-center">
          <RebondLstUnstakeRequestButton
            canRebond={canRebondAllSelected}
            unlockIds={selectedRowsUnlockIds}
          />

          <WithdrawLstUnstakeRequestButton
            canWithdraw={canWithdrawAllSelected}
            unlockIds={selectedRowsUnlockIds}
          />
        </div>
      </GlassCard>

      {data !== null && data.length === 0 && (
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

export default UnstakeRequestsTable;
