'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Chip,
  EMPTY_VALUE_PLACEHOLDER,
  InfoIconWithTooltip,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';
import { FC, useMemo, useState } from 'react';
import TokenAmountCell from '../../components/tableCells/TokenAmountCell';
import useLockRows from './useLockRows';
import { BN } from '@polkadot/util';
import { SubstrateLockId } from '../../constants';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import { TableStatus } from '../../components';
import pluralize from '../../utils/pluralize';
import { CheckboxCircleFill } from '@webb-tools/icons';

export enum LockUnlocksAtKind {
  ERA,
  BLOCK,
}

export type BalanceLockRow = {
  index?: number;
  type: SubstrateLockId;
  unlocksAt?: BN;
  unlocksAtKind: LockUnlocksAtKind;
  isUnlocked?: boolean;
  unlocksAtTooltip?: string;
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

const getSubstrateLockIdText = (lockId: SubstrateLockId) => {
  switch (lockId) {
    case SubstrateLockId.STAKING:
      return 'Staking';
    case SubstrateLockId.DEMOCRACY:
      return 'Democracy';
    case SubstrateLockId.VESTING:
      return 'Vesting';
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
        cell: (props) => {
          // Helps differentiate between locks of the same type.
          const index =
            props.row.original.index !== undefined
              ? `#${props.row.original.index + 1}`
              : '';

          return (
            <Chip color="purple">
              <Typography
                variant="body3"
                fw="semibold"
                className="uppercase text-purple-60 dark:text-purple-40"
              >
                {getSubstrateLockIdText(props.getValue())} {index}
              </Typography>
            </Chip>
          );
        },
      }),
      COLUMN_HELPER.accessor('totalLocked', {
        header: () => 'Total Locked',
        cell: (props) => <TokenAmountCell amount={props.getValue()} />,
      }),
      COLUMN_HELPER.accessor('remaining', {
        header: () => 'Remaining',
        cell: (props) => <TokenAmountCell amount={props.getValue()} />,
      }),
      COLUMN_HELPER.accessor('unlocksAt', {
        header: () => 'Unlocks At',
        cell: (props) => {
          if (props.row.original.isUnlocked) {
            return (
              <CheckboxCircleFill className="fill-green-700 dark:fill-green-700" />
            );
          }

          const unlocksAt = props.getValue();

          if (unlocksAt === undefined) {
            return EMPTY_VALUE_PLACEHOLDER;
          }

          return (
            <div className="flex items-center justify-start gap-1">
              {getLockUnlockKindText(props.row.original.unlocksAtKind)} #
              {addCommasToNumber(unlocksAt)}
              {props.row.original.unlocksAtTooltip && (
                <InfoIconWithTooltip
                  content={props.row.original.unlocksAtTooltip}
                />
              )}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const rows = useLockRows();

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
      variant={TableVariant.EMBEDDED_IN_MODAL}
      tableProps={table}
      title={pluralize('lock', rows.length !== 1)}
      isPaginated
    />
  );
};

export default LockedBalancesTable;
