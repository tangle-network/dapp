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
  AddCircleLineIcon,
  SubtractCircleLineIcon,
} from '@tangle-network/icons';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  ActionsDropdown,
  AmountFormatStyle,
  Avatar,
  AvatarGroup,
  Table,
  TANGLE_DOCS_LIQUID_STAKING_URL,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { ActionItemType } from '@tangle-network/ui-components/components/ActionsDropdown/types';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import assert from 'assert';
import { FC, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { LsPool } from '../../constants/liquidStaking/types';
import LsUpdateRolesModal from '../../containers/LsUpdateRolesModal';
import useLsSetStakingIntent from '../../data/liquidStaking/useLsSetStakingIntent';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import BlueIconButton from '../BlueIconButton';
import PercentageCell from '../tableCells/PercentageCell';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import LstIcon from './LstIcon';
import UpdateCommissionModal from './UpdateCommissionModal';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import LsSetPoolStateModal from './LsSetPoolStateModal';
import LsUpdateNominationsModal from './LsUpdateNominationsModal';

export interface LsMyPoolRow extends LsPool {
  myStake: BN;
  isRoot: boolean;
  isNominator: boolean;
  isBouncer: boolean;
}

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
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);

  const [isUpdateCommissionModalOpen, setIsUpdateCommissionModalOpen] =
    useState(false);

  const [isUpdateNominationsModalOpen, setIsUpdateNominationsModalOpen] =
    useState(false);

  const [isUpdateRolesModalOpen, setIsUpdateRolesModalOpen] = useState(false);
  const [isSetStateModalOpen, setIsSetStateModalOpen] = useState(false);

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
          <div className="flex gap-2 items-center justify-start">
            <LstIcon iconUrl={props.row.original.iconUrl} />

            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {props.row.original.name?.toUpperCase()}
              <span className="text-mono-180 dark:text-mono-120">
                #{props.getValue()}
              </span>
            </Typography>
          </div>
        ),
      }),
      COLUMN_HELPER.accessor('ownerAddress', {
        header: () => 'Owner',
        cell: (props) => {
          const ownerAddress = props.getValue();

          if (ownerAddress === undefined) {
            return EMPTY_VALUE_PLACEHOLDER;
          }

          return (
            <Tooltip>
              <TooltipTrigger>
                <Avatar
                  sourceVariant="address"
                  value={props.getValue()}
                  theme="substrate"
                />
              </TooltipTrigger>

              <TooltipBody className="max-w-none">{ownerAddress}</TooltipBody>
            </Tooltip>
          );
        },
      }),
      COLUMN_HELPER.accessor('validators', {
        header: () => 'Validators',
        cell: (props) =>
          props.row.original.validators.length === 0 ? (
            EMPTY_VALUE_PLACEHOLDER
          ) : (
            <AvatarGroup total={props.row.original.validators.length}>
              {props.row.original.validators.map((substrateAddress) => (
                <Tooltip key={substrateAddress}>
                  <TooltipTrigger>
                    <Avatar
                      sourceVariant="address"
                      value={substrateAddress}
                      theme="substrate"
                    />
                  </TooltipTrigger>

                  <TooltipBody className="max-w-none">
                    {substrateAddress}
                  </TooltipBody>
                </Tooltip>
              ))}
            </AvatarGroup>
          ),
      }),
      COLUMN_HELPER.accessor('totalStaked', {
        header: () => 'Total Staked (TVL)',
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            decimals={TANGLE_TOKEN_DECIMALS}
            formatStyle={AmountFormatStyle.SI}
          />
        ),
      }),
      COLUMN_HELPER.accessor('myStake', {
        header: () => 'My Stake',
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            decimals={TANGLE_TOKEN_DECIMALS}
            formatStyle={AmountFormatStyle.SHORT}
          />
        ),
      }),
      COLUMN_HELPER.accessor('commissionFractional', {
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
              onClick: () => {
                setSelectedPoolId(props.row.original.id);
                setIsUpdateNominationsModalOpen(true);
              },
            });
          }

          // Root can update the commission and roles.
          if (props.row.original.isRoot) {
            actionItems.push({
              label: 'Update Commission',
              onClick: () => {
                setSelectedPoolId(props.row.original.id);
                setIsUpdateCommissionModalOpen(true);
              },
            });

            actionItems.push({
              label: 'Update Roles',
              onClick: () => {
                setSelectedPoolId(props.row.original.id);
                setIsUpdateRolesModalOpen(true);
              },
            });
          }

          // Bouncer can close or open entry into the pool.
          if (props.row.original.isBouncer) {
            actionItems.push({
              label: 'Set State',
              onClick: () => {
                setSelectedPoolId(props.row.original.id);
                setIsSetStateModalOpen(true);
              },
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

          const isPoolDestroying = props.row.original.state === 'Destroying';

          return (
            <div className="flex justify-end gap-1">
              {/**
               * Show management actions if the active user has any role in
               * the pool.
               */}
              {hasAnyRole && !isPoolDestroying && (
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
                isDisabled={isStakeActionDisabled || isPoolDestroying}
                onClick={() => setLsStakingIntent(props.row.original.id, true)}
                tooltip={
                  isPoolDestroying
                    ? 'Pool is being destroyed; cannot increase stake.'
                    : 'Increase Stake'
                }
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

  const selectedPoolCommission = useMemo(() => {
    if (selectedPoolId === null) {
      return null;
    }

    const selectedPool = pools.find((pool) => pool.id === selectedPoolId);

    return selectedPool === undefined
      ? null
      : (selectedPool.commissionFractional ?? null);
  }, [pools, selectedPoolId]);

  // Reset the selected pool's ID after all the management modals are closed.
  useEffect(() => {
    if (!isUpdateCommissionModalOpen && !isUpdateRolesModalOpen) {
      setSelectedPoolId(null);
    }
  }, [isUpdateCommissionModalOpen, isUpdateRolesModalOpen]);

  // TODO: Missing error and loading state. Should ideally abstract all these states into an abstract Table component, since it's getting reused in multiple places.
  if (!isAccountConnected) {
    return (
      <TableStatus
        title="Wallet Not Connected"
        description="Once you've connected an account, you'll be able to increase stake, unstake, and manage your liquid staking pools here."
      />
    );
  } else if (pools.length === 0) {
    return (
      <TableStatus
        title="No Active Pools"
        description="You haven't staked in any pools yet. Select a pool and start liquid staking to earn rewards! Once you've staked or created a pool, you'll be able to manage your stake and configure the pool here."
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
        variant={TableVariant.GLASS_INNER}
        tableProps={table}
        title={pluralize('pool', pools.length > 1 || pools.length === 0)}
        className={twMerge(isShown ? 'animate-slide-down' : 'animate-slide-up')}
        isPaginated
      />

      <LsUpdateRolesModal
        poolId={selectedPoolId}
        isOpen={isUpdateRolesModalOpen}
        setIsOpen={setIsUpdateRolesModalOpen}
      />

      <UpdateCommissionModal
        poolId={selectedPoolId}
        currentCommissionFractional={selectedPoolCommission}
        isOpen={isUpdateCommissionModalOpen}
        setIsOpen={setIsUpdateCommissionModalOpen}
      />

      <LsSetPoolStateModal
        poolId={selectedPoolId}
        isOpen={isSetStateModalOpen}
        setIsOpen={setIsSetStateModalOpen}
      />

      <LsUpdateNominationsModal
        poolId={selectedPoolId}
        isOpen={isUpdateNominationsModalOpen}
        setIsOpen={setIsUpdateNominationsModalOpen}
      />
    </>
  );
};

export default LsMyPoolsTable;
