'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { CheckboxCircleFill, TimeFillIcon } from '@webb-tools/icons';
import {
  Table,
  TANGLE_DOCS_LIQUID_STAKING_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';
import { FC, useMemo, useState } from 'react';

import { LsPoolUnstakeRequest } from '../../constants/liquidStaking/types';
import useLsUnbonding from '../../data/liquidStaking/useLsUnbonding';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import pluralize from '../../utils/pluralize';
import { ContainerSkeleton, TableStatus } from '..';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import LstIcon from './LstIcon';
import WithdrawUnstakeRequestButton from './WithdrawUnstakeRequestButton';

const COLUMN_HELPER = createColumnHelper<LsPoolUnstakeRequest>();

const LsUnbondingTable: FC = () => {
  const unstakeRequests = useLsUnbonding();
  const isAccountConnected = useIsAccountConnected();
  const [sorting, setSorting] = useState<SortingState>([]);

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
        header: () => 'Pool ID',
        cell: (props) => (
          <div className="flex gap-2 items-center justify-start">
            <LstIcon
              lsProtocolId={props.row.original.poolProtocolId}
              iconUrl={props.row.original.poolIconUrl}
            />

            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {props.row.original.poolName?.toUpperCase()}
              <span className="text-mono-180 dark:text-mono-120">
                #{props.getValue()}
              </span>
            </Typography>
          </div>
        ),
      }),
      COLUMN_HELPER.accessor('amount', {
        header: () => 'Amount',
        cell: (props) => {
          const unstakeRequest = props.row.original;

          return (
            <TokenAmountCell
              amount={props.getValue()}
              symbol={unstakeRequest.token}
              decimals={props.row.original.decimals}
            />
          );
        },
      }),
      COLUMN_HELPER.accessor('erasLeftToUnlock', {
        header: () => 'Status',
        cell: (props) => {
          const erasLeftToUnlock = props.getValue();

          const progressText = (() => {
            return erasLeftToUnlock === undefined
              ? undefined
              : `${addCommasToNumber(erasLeftToUnlock)} ${pluralize('era', erasLeftToUnlock !== 1)} left`;
          })();

          const content =
            progressText === undefined ? (
              <CheckboxCircleFill className="dark:fill-green-50" />
            ) : (
              <div className="flex gap-1 items-center justify-center">
                <TimeFillIcon className="dark:fill-blue-50" /> {progressText}
              </div>
            );

          return (
            <div className="flex items-center justify-start">{content}</div>
          );
        },
      }),
      COLUMN_HELPER.accessor('unlockEra', {
        header: () => 'Unlocks At Era',
        cell: (props) => (
          <div className="flex items-center justify-start">
            #{addCommasToNumber(props.getValue())}
          </div>
        ),
      }),
      COLUMN_HELPER.display({
        id: 'actions',
        cell: (props) => {
          return (
            <div className="flex items-center justify-end">
              <WithdrawUnstakeRequestButton
                isReadyToWithdraw={props.row.original.isReadyToWithdraw}
                lsPoolId={props.row.original.poolId}
              />
            </div>
          );
        },
      }),
    ],
    [],
  );

  const rows = useMemo(() => unstakeRequests ?? [], [unstakeRequests]);

  const table = useReactTable({
    data: rows,
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

  if (!isAccountConnected) {
    return (
      <TableStatus
        title="Connect a wallet to continue"
        description="Once you've connected an account, you'll be able to see and manage your liquid staking pools' unstaking requests here."
        icon="🔍"
      />
    );
  } else if (unstakeRequests === null) {
    return <ContainerSkeleton />;
  } else if (rows.length === 0) {
    return (
      <TableStatus
        title="No Unstake Requests"
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
    <Table
      variant={TableVariant.DEFAULT}
      tableProps={table}
      title={pluralize('unstake request', rows.length !== 1)}
      isPaginated
    />
  );
};

export default LsUnbondingTable;
