'use client';

import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  CheckboxCircleFill,
  CheckboxCircleLine,
  SubtractCircleLineIcon,
  TimeFillIcon,
} from '@webb-tools/icons';
import {
  Table,
  TANGLE_DOCS_LIQUID_STAKING_URL,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo, useState } from 'react';

import { LsPoolUnstakeRequest } from '../../constants/liquidStaking/types';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import addCommasToNumber from '../../utils/addCommasToNumber';
import stringifyTimeUnit from '../../utils/liquidStaking/stringifyTimeUnit';
import pluralize from '../../utils/pluralize';
import { TableStatus } from '..';
import BlueIconButton from '../BlueIconButton';
import { HeaderCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import { sharedTableStatusClxs } from '../tables/shared';
import CancelUnstakeModal from './unstakeRequestsTable/CancelUnstakeModal';
import ExecuteUnstakeRequestModal from './unstakeRequestsTable/ExecuteUnstakeRequestModal';

const COLUMN_HELPER = createColumnHelper<LsPoolUnstakeRequest>();

const LsUnbondingTable: FC = () => {
  const isAccountConnected = useIsAccountConnected();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);

  const [isCancelUnstakeModalOpen, setIsCancelUnstakeModalOpen] =
    useState(false);

  const [isExecuteUnstakeModalOpen, setIsExecuteUnstakeModalOpen] =
    useState(false);

  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const columns = useMemo(
    () => [
      COLUMN_HELPER.accessor('poolId', {
        header: () => 'LST',
        cell: (props) => (
          <div className="flex items-center justify-start gap-2">
            #{addCommasToNumber(props.getValue())}
          </div>
        ),
      }),
      COLUMN_HELPER.accessor('unlockId', {
        header: () => 'Request ID',
        cell: (props) => (
          <div className="flex items-center justify-start gap-2">
            #{addCommasToNumber(props.getValue())}
          </div>
        ),
      }),
      COLUMN_HELPER.accessor('amount', {
        header: () => <HeaderCell title="Amount" className="justify-center" />,
        cell: (props) => {
          const unstakeRequest = props.row.original;
          const tokenSymbol = unstakeRequest.currency.toUpperCase();

          return (
            <TokenAmountCell
              amount={props.getValue()}
              symbol={tokenSymbol}
              decimals={props.row.original.decimals}
            />
          );
        },
        // TODO: Maturity date (time left) columns. Also add an info icon tooltip for the maturity date to show the exact unlock date on hover.
      }),
      COLUMN_HELPER.accessor('progress', {
        header: () => <HeaderCell title="Status" className="justify-center" />,
        cell: (props) => {
          const progress = props.getValue();

          const progressString = (() => {
            return progress === undefined
              ? undefined
              : stringifyTimeUnit(progress).join(' ');
          })();

          const content =
            progressString === undefined ? (
              <CheckboxCircleFill className="dark:fill-green-50" />
            ) : (
              <div className="flex gap-1 items-center justify-center">
                <TimeFillIcon className="dark:fill-blue-50" /> {progressString}
              </div>
            );

          return (
            <div className="flex items-center justify-start">{content}</div>
          );
        },
      }),
      COLUMN_HELPER.display({
        id: 'actions',
        cell: (props) => {
          // TODO: Disable buttons depending on the request's state/progress.

          return (
            <div className="flex justify-end gap-1">
              <BlueIconButton
                // isDisabled={isUnstakeActionDisabled}
                onClick={() => {
                  setSelectedPoolId(props.row.original.poolId);
                  setIsCancelUnstakeModalOpen(true);
                }}
                tooltip="Cancel"
                Icon={SubtractCircleLineIcon}
              />

              <BlueIconButton
                // isDisabled={isStakeActionDisabled}
                onClick={() => {
                  setSelectedPoolId(props.row.original.poolId);
                  setIsExecuteUnstakeModalOpen(true);
                }}
                tooltip="Execute"
                Icon={CheckboxCircleLine}
              />
            </div>
          );
        },
      }),
    ],
    [],
  );

  const unstakeRequests: LsPoolUnstakeRequest[] = [
    {
      poolId: 1,
      unlockId: 1,
      decimals: 18,
      amount: new BN('854854385848358348538'),
      currency: 'Eth',
    },
    {
      poolId: 2,
      unlockId: 2,
      decimals: 18,
      amount: new BN('854854385848358348538'),
      currency: 'Bnc',
    },
    {
      poolId: 3,
      unlockId: 3,
      decimals: 18,
      amount: new BN('454353467576'),
      currency: 'Ksm',
    },
  ];

  const table = useReactTable({
    data: unstakeRequests,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  // TODO: Missing error and loading state. Should ideally abstract all these states into an abstract Table component, since it's getting reused in multiple places.
  if (!isAccountConnected) {
    return (
      <TableStatus
        className={sharedTableStatusClxs}
        title="Connect a wallet to continue"
        description="Once you've connected an account, you'll be able to see and manage your liquid staking pools' unstaking requests here."
        icon="🔍"
      />
    );
  } else if (unstakeRequests.length === 0) {
    return (
      <TableStatus
        title="No unstake requests"
        className={sharedTableStatusClxs}
        description="Once you've scheduled an unstake request, you'll see information about it here."
        icon="🔍"
        buttonText="Learn More"
        buttonProps={{
          href: TANGLE_DOCS_LIQUID_STAKING_URL,
          target: '_blank',
        }}
      />
    );
  }

  return (
    <>
      <Table
        tableProps={table}
        title={pluralize('unstake request', unstakeRequests.length !== 1)}
        className="rounded-2xl overflow-hidden bg-mono-20 dark:bg-mono-200 px-3"
        thClassName="py-3 !font-normal !bg-transparent border-t-0 border-b text-mono-120 dark:text-mono-100 border-mono-60 dark:border-mono-160"
        tbodyClassName="!bg-transparent"
        tdClassName="!bg-inherit border-t-0"
        isPaginated
      />

      <ExecuteUnstakeRequestModal
        lsPoolId={selectedPoolId}
        isOpen={isExecuteUnstakeModalOpen}
        setIsOpen={setIsExecuteUnstakeModalOpen}
      />

      <CancelUnstakeModal
        lsPoolId={selectedPoolId}
        isOpen={isCancelUnstakeModalOpen}
        setIsOpen={setIsCancelUnstakeModalOpen}
      />
    </>
  );
};

export default LsUnbondingTable;
