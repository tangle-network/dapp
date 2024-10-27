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
import { AddCircleLineIcon, SubtractCircleLineIcon } from '@webb-tools/icons';
import {
  ActionsDropdown,
  Avatar,
  AvatarGroup,
  Table,
  TANGLE_DOCS_LIQUID_STAKING_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ActionItemType } from '@webb-tools/webb-ui-components/components/ActionsDropdown/types';
import assert from 'assert';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import {
  LsPool,
  LsPoolDisplayName,
  LsProtocolId,
} from '../../constants/liquidStaking/types';
import useLsSetStakingIntent from '../../data/liquidStaking/useLsSetStakingIntent';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import pluralize from '../../utils/pluralize';
import { TableStatus } from '..';
import BlueIconButton from '../BlueIconButton';
import PercentageCell from '../tableCells/PercentageCell';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import { sharedTableStatusClxs } from '../tables/shared';
import UpdateCommissionModal from './UpdateCommissionModal';

export type LsMyPoolRow = LsPool & {
  myStake: BN;
  lsProtocolId: LsProtocolId;
  isRoot: boolean;
  isNominator: boolean;
  isBouncer: boolean;
};

const COLUMN_HELPER = createColumnHelper<LsMyPoolRow>();

export type LsMyPoolsTableProps = {
  pools: LsMyPoolRow[];
  isShown: boolean;
};

const LsMyPoolsTable: FC<LsMyPoolsTableProps> = ({ pools, isShown }) => {
  const isAccountConnected = useIsAccountConnected();
  const [sorting, setSorting] = useState<SortingState>([]);
  const { lsPoolId, isStaking } = useLsStore();
  const setLsStakingIntent = useLsSetStakingIntent();

  const [isUpdateCommissionModalOpen, setIsUpdateCommissionModalOpen] =
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
      COLUMN_HELPER.accessor('id', {
        header: () => 'ID',
        cell: (props) => (
          <Typography
            variant="body2"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            {(
              `${props.row.original.name}#${props.getValue()}` satisfies LsPoolDisplayName
            ).toUpperCase()}
          </Typography>
        ),
      }),
      COLUMN_HELPER.accessor('ownerAddress', {
        header: () => 'Owner',
        cell: (props) => (
          <Avatar
            sourceVariant="address"
            value={props.row.original.ownerAddress}
            theme="substrate"
          />
        ),
      }),
      COLUMN_HELPER.accessor('validators', {
        header: () => 'Validators',
        cell: (props) =>
          props.row.original.validators.length === 0 ? (
            EMPTY_VALUE_PLACEHOLDER
          ) : (
            <AvatarGroup total={props.row.original.validators.length}>
              {props.row.original.validators.map((substrateAddress) => (
                <Avatar
                  key={substrateAddress}
                  // TODO: In the future, it'd be better if we show the identity of the validator, rather than just the address.
                  tooltip={substrateAddress}
                  sourceVariant="address"
                  value={substrateAddress}
                  theme="substrate"
                />
              ))}
            </AvatarGroup>
          ),
      }),
      COLUMN_HELPER.accessor('totalStaked', {
        header: () => 'Total Staked (TVL)',
        // TODO: Decimals.
        cell: (props) => <TokenAmountCell amount={props.getValue()} />,
      }),
      COLUMN_HELPER.accessor('myStake', {
        header: () => 'My Stake',
        cell: (props) => <TokenAmountCell amount={props.getValue()} />,
      }),
      COLUMN_HELPER.accessor('commissionPercentage', {
        header: () => 'Commission',
        cell: (props) => <PercentageCell percentage={props.getValue()} />,
      }),
      COLUMN_HELPER.accessor('apyPercentage', {
        header: () => 'APY',
        cell: (props) => <PercentageCell percentage={props.getValue()} />,
      }),
      COLUMN_HELPER.display({
        id: 'actions',
        cell: (props) => {
          const actionItems: ActionItemType[] = [];

          // Nominator can update nominations.
          if (props.row.original.isNominator) {
            actionItems.push({
              label: 'Update Nominations',
              // TODO: Implement onClick handler.
              onClick: () => void 0,
            });
          }

          // Bouncer can close or open entry into the pool.
          if (props.row.original.isBouncer) {
            // TODO: Bouncer options.
          }

          // Root can update the commission and roles.
          if (props.row.original.isRoot) {
            actionItems.push({
              label: 'Update Commission',
              onClick: () => setIsUpdateCommissionModalOpen(true),
            });

            actionItems.push({
              label: 'Update Roles',
              // TODO: Implement onClick handler.
              onClick: () => void 0,
            });
          }

          const hasAnyRole =
            props.row.original.isRoot ||
            props.row.original.isNominator ||
            props.row.original.isBouncer;

          // Sanity check against logic errors.
          if (hasAnyRole) {
            assert(actionItems.length > 0);
          }

          // Disable the unstake button if the pool is currently selected,
          // and the active intent is to unstake.
          const isUnstakeActionDisabled =
            lsPoolId === props.row.original.id && !isStaking;

          // Disable the stake button if the pool is currently selected,
          // and the active intent is to stake.
          const isStakeActionDisabled =
            lsPoolId === props.row.original.id && isStaking;

          return (
            <div className="flex justify-end gap-1">
              {/**
               * Show management actions if the active user has any role in
               * the pool.
               */}
              {hasAnyRole && (
                <ActionsDropdown
                  buttonText="Manage"
                  actionItems={actionItems}
                />
              )}

              <BlueIconButton
                isDisabled={isUnstakeActionDisabled}
                onClick={() => setLsStakingIntent(props.row.original.id, false)}
                tooltip="Unstake"
                Icon={SubtractCircleLineIcon}
              />

              <BlueIconButton
                isDisabled={isStakeActionDisabled}
                onClick={() => setLsStakingIntent(props.row.original.id, true)}
                tooltip="Increase Stake"
                Icon={AddCircleLineIcon}
              />
            </div>
          );
        },
      }),
    ],
    [isStaking, lsPoolId, setLsStakingIntent],
  );

  const table = useReactTable({
    data: pools,
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
        description="Once you've connected an account, you'll be able to see and manage your liquid staking pools here."
        icon="🔍"
      />
    );
  } else if (pools.length === 0) {
    return (
      <TableStatus
        title="No active pools"
        className={sharedTableStatusClxs}
        description="You haven't staked in any pools yet. Select a pool and start liquid staking to earn rewards! Once you've staked or created a pool, you'll be able to manage your stake and configure the pool here."
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
        title={pluralize('pool', pools.length > 1 || pools.length === 0)}
        className={twMerge(
          'rounded-2xl overflow-hidden bg-mono-20 dark:bg-mono-200 px-3',
          isShown ? 'animate-slide-down' : 'animate-slide-up',
        )}
        thClassName="py-3 !font-normal !bg-transparent border-t-0 border-b text-mono-120 dark:text-mono-100 border-mono-60 dark:border-mono-160"
        tbodyClassName="!bg-transparent"
        tdClassName="!bg-inherit border-t-0"
        isPaginated
      />

      <UpdateCommissionModal
        poolId={0}
        currentCommission={0}
        isOpen={isUpdateCommissionModalOpen}
        setIsOpen={setIsUpdateCommissionModalOpen}
      />
    </>
  );
};

export default LsMyPoolsTable;
