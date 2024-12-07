'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Chip, Table, Typography } from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';
import { FC, useMemo, useState } from 'react';

import { SubstrateLockId } from '../constants';
import { BN } from '@polkadot/util';
import TokenAmountCell from '../components/tableCells/TokenAmountCell';
import { TableStatus } from '../components';
import pluralize from '../utils/pluralize';
import useIsAccountConnected from '../hooks/useIsAccountConnected';

export enum LockUnlocksAtKind {
  ERA,
  BLOCK,
}

type BalanceLockRow = {
  type: SubstrateLockId;
  unlocksAt: number;
  unlocksAtKind: LockUnlocksAtKind;
  totalLocked: BN;
  remaining: BN;
};

const getLockUnlockKindText = (kind: LockUnlocksAtKind) => {
  switch (kind) {
    case LockUnlocksAtKind.ERA:
      return 'Era';
    case LockUnlocksAtKind.BLOCK:
      return 'Block';
  }
};

const COLUMN_HELPER = createColumnHelper<BalanceLockRow>();

const LockedBalancesTable: FC = () => {
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
      COLUMN_HELPER.accessor('type', {
        header: () => 'Type',
        cell: (props) => (
          <Chip color="purple">
            <Typography
              variant="body3"
              fw="semibold"
              className="uppercase text-purple-60 dark:text-purple-40"
            >
              {props.getValue()}
            </Typography>
          </Chip>
        ),
      }),
      COLUMN_HELPER.accessor('totalLocked', {
        header: () => 'Total Locked',
        cell: (props) => <TokenAmountCell amount={props.getValue()} />,
      }),
      COLUMN_HELPER.accessor('unlocksAt', {
        header: () => 'Unlocks At',
        cell: (props) => (
          <div className="flex items-center justify-start">
            {getLockUnlockKindText(props.row.original.unlocksAtKind)} #
            {addCommasToNumber(props.getValue())}
          </div>
        ),
      }),
      // COLUMN_HELPER.display({
      //   id: 'actions',
      //   cell: (props) => {
      //     return (
      //       <div className="flex items-center justify-end">
      //         <WithdrawUnstakeRequestButton
      //           isReadyToWithdraw={props.row.original.isReadyToWithdraw}
      //           lsPoolId={props.row.original.poolId}
      //         />
      //       </div>
      //     );
      //   },
      // }),
    ],
    [],
  );

  const rows = useMemo<BalanceLockRow[]>(
    () => [
      {
        type: SubstrateLockId.STAKING,
        symbol: 'tTNT',
        unlocksAt: 100,
        unlocksAtKind: LockUnlocksAtKind.BLOCK,
        totalLocked: new BN(1204000500),
        remaining: new BN(10000000),
      },
      {
        type: SubstrateLockId.DEMOCRACY,
        symbol: 'tTNT',
        unlocksAt: 1231,
        unlocksAtKind: LockUnlocksAtKind.BLOCK,
        totalLocked: new BN(1204000500),
        remaining: new BN(10000000),
      },
      {
        type: SubstrateLockId.VESTING,
        symbol: 'tTNT',
        unlocksAt: 3234,
        unlocksAtKind: LockUnlocksAtKind.BLOCK,
        totalLocked: new BN(1204000500),
        remaining: new BN(10000000),
      },
    ],
    [],
  );

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
        description="Once you've connected an account, you'll be able to see your locked balances here."
        icon="🔍"
      />
    );
  }
  // else if (unstakeRequests === null) {
  //   return <ContainerSkeleton />;
  // }
  else if (rows.length === 0) {
    return (
      <TableStatus
        title="No Locked Balances"
        description="This account doesn't current have any locks on its balances."
        icon="🔍"
      />
    );
  }

  return (
    <Table
      variant={TableVariant.DEFAULT}
      tableProps={table}
      title={pluralize('lock', rows.length !== 1)}
      isPaginated
    />
  );
};

export default LockedBalancesTable;
