'use client';

import { BN } from '@polkadot/util';
import {
  ChevronDown,
  ChevronUp,
  CoinIcon,
  SendPlanLineIcon,
  TangleIcon,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  IconButton,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, JSX, useMemo, useState } from 'react';

import { InfoIconWithTooltip } from '../../components';
import GlassCard from '../../components/GlassCard/GlassCard';
import { SubstrateLockId, TANGLE_TOKEN_UNIT } from '../../constants';
import useAccountBalances from '../../hooks/useAccountBalances';
import useFormattedBalance from '../../hooks/useFormattedBalance';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useVesting from '../../hooks/useVesting';
import getSubstrateLockId from '../../utils/getSubstrateLockId';

const BalancesTableContainer: FC = () => {
  const { transferrable, locked } = useAccountBalances();
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  return (
    <GlassCard className="overflow-x-auto">
      <div className="flex flex-row">
        {/* Asset column */}
        <div className="flex flex-col w-full">
          <HeaderRow title="Asset" />

          <AssetRow
            title="Transferrable Balance"
            tooltip="The amount of tokens you can freely transfer right now."
          />

          <AssetRow
            title="Locked Balance"
            tooltip="The total tokens subject to limitations, such as those locked in staking, democracy participation, or undergoing vesting. You might not have full access to these tokens at the moment."
          />
        </div>

        {/* Balance column */}
        <div className="flex flex-col w-full">
          <HeaderRow title="Balance" />

          {/* Transferrable balance */}
          <div className="flex flex-row justify-between">
            <BalanceRow amount={transferrable} />

            <div className="flex flex-row gap-1">
              <BalanceAction
                Icon={SendPlanLineIcon}
                tooltip="Send"
                onClick={() => void 0}
              />

              <BalanceAction
                Icon={CoinIcon}
                tooltip="Nominate"
                onClick={() => void 0}
              />
            </div>
          </div>

          {/* Locked balance */}
          <div className="flex flex-row justify-between">
            <BalanceRow amount={locked} />

            {/* TODO: Do not show this action if there are no locks whatsoever. */}
            <BalanceAction
              Icon={isDetailsCollapsed ? ChevronDown : ChevronUp}
              tooltip={`${isDetailsCollapsed ? 'Show' : 'Collapse'} Details`}
              onClick={() => setIsDetailsCollapsed((previous) => !previous)}
            />
          </div>
        </div>
      </div>

      {!isDetailsCollapsed && <LockedBalanceDetails />}
    </GlassCard>
  );
};

/** @internal */
const HeaderRow: FC<{ title: string }> = ({ title }) => {
  return (
    <Typography
      variant="body1"
      fw="semibold"
      className="block border-b dark:border-mono-140 px-3 pb-3 capitalize whitespace-nowrap"
    >
      {title}
    </Typography>
  );
};

/** @internal */
const AssetRow: FC<{
  title: string;
  tooltip?: string;
}> = ({ title, tooltip }) => {
  return (
    <div className="flex px-3 py-3 gap-6">
      <div className="flex flex-row items-center gap-1">
        <div className="bg-mono-40 dark:bg-mono-0 p-1 rounded-full">
          <TangleIcon />
        </div>

        <Typography variant="body1" fw="semibold" className="dark:text-mono-0">
          {TANGLE_TOKEN_UNIT}
        </Typography>
      </div>

      <div className="flex gap-1">
        <Typography variant="body1" fw="semibold" className="whitespace-nowrap">
          {title}
        </Typography>

        {tooltip !== undefined && (
          <InfoIconWithTooltip
            content={<span className="block text-center">{tooltip}</span>}
          />
        )}
      </div>
    </div>
  );
};

// TODO: Consider moving this to a separate file since it's getting quite big.
/** @internal */
const LockedBalanceDetails: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt, isVesting } = useVesting();

  const { data: locks } = usePolkadotApiRx((api, activeSubstrateAddress) =>
    api.query.balances.locks(activeSubstrateAddress)
  );

  const lockedInVesting = useMemo(() => {
    if (locks === null) {
      return null;
    }

    for (const lock of locks) {
      // If the reason of the lock is vesting, then consider it.
      if (getSubstrateLockId(lock.id) === SubstrateLockId.Vesting) {
        return lock.amount;
      }
    }

    return new BN(0);
  }, [locks]);

  const longestVestingScheduleEndingBlock = useMemo(() => {
    if (vestingSchedulesOpt === null || vestingSchedulesOpt.isNone) {
      return null;
    }

    const vestingSchedules = vestingSchedulesOpt.unwrap();

    assert(
      vestingSchedules.length > 0,
      'There should be at least one vesting schedule if the vesting schedules are not `None`'
    );

    const firstVestingSchedule = vestingSchedules[0];

    let longestEndingBlockNumber = firstVestingSchedule.startingBlock.add(
      firstVestingSchedule.locked.div(firstVestingSchedule.perBlock)
    );

    for (const schedule of vestingSchedules.slice(1)) {
      const duration = schedule.locked.div(schedule.perBlock);
      const endingBlockNumber = schedule.startingBlock.add(duration);

      if (endingBlockNumber.gt(longestEndingBlockNumber)) {
        longestEndingBlockNumber = endingBlockNumber;
      }
    }

    return longestEndingBlockNumber;
  }, [vestingSchedulesOpt]);

  return (
    <div className="flex flex-row dark:bg-mono-180 px-3 py-2 rounded-lg">
      <div className="flex flex-row w-full">
        {/* Type column */}
        <div className="flex flex-col gap-6 w-full items-start">
          <div className="self-stretch">
            <HeaderRow title="Type" />
          </div>

          {isVesting && <SmallPurpleChip title="Vesting" />}

          <SmallPurpleChip title="Democracy" />

          <SmallPurpleChip title="Nomination" />
        </div>

        {/* Unlock details column */}
        <div className="flex flex-col gap-6 w-full">
          <HeaderRow title="Unlocks At" />

          {isVesting && (
            <TextRow
              text={`Block #${longestVestingScheduleEndingBlock} / Era #90`}
            />
          )}

          <TextRow text="Block #100 / Era #90" />

          <TextRow text="Block #100 / Era #90" />
        </div>
      </div>

      {/* Balance column */}
      <div className="flex flex-col gap-6 w-full">
        <HeaderRow title="Balance" />

        <div className="flex flex-row justify-between">
          {isVesting && <BalanceRow amount={lockedInVesting} />}

          <div className="flex flex-row gap-1">
            <BalanceAction
              Icon={SendPlanLineIcon}
              tooltip="Send"
              onClick={() => void 0}
            />

            <BalanceAction
              Icon={CoinIcon}
              tooltip="Nominate"
              onClick={() => void 0}
            />
          </div>
        </div>

        <BalanceRow amount={null} />

        <BalanceRow amount={null} />
      </div>
    </div>
  );
};

/** @internal */
const SmallPurpleChip: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="p-3">
      <div className="dark:bg-purple-120 rounded-3xl px-4 py-1">
        <Typography
          variant="body2"
          fw="semibold"
          className="uppercase text-purple-50 dark:text-purple-50"
        >
          {title}
        </Typography>
      </div>
    </div>
  );
};

/** @internal */
const TextRow: FC<{
  text: string | null;
}> = ({ text }) => {
  return (
    <div className="flex flex-col justify-between p-3 gap-6">
      {text !== null ? (
        <Typography variant="body1" fw="semibold">
          {text}
        </Typography>
      ) : (
        <SkeletonLoader size="md" />
      )}
    </div>
  );
};

/** @internal */
const BalanceRow: FC<{
  amount: BN | null;
}> = ({ amount }) => {
  const formattedBalance = useFormattedBalance(amount, true);

  return (
    <div className="flex flex-col justify-between p-3 gap-6 flex-grow">
      {amount !== null ? (
        <Typography variant="body1" fw="semibold">
          {formattedBalance}
        </Typography>
      ) : (
        <SkeletonLoader className="max-w-[128px]" size="md" />
      )}
    </div>
  );
};

/** @internal */
const BalanceAction: FC<{
  tooltip: string;
  onClick: () => void;
  Icon: (props: IconBase) => JSX.Element;
}> = ({ tooltip, Icon, onClick }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <IconButton onClick={onClick}>
          <Icon size="md" />
        </IconButton>
      </TooltipTrigger>

      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

export default BalancesTableContainer;
