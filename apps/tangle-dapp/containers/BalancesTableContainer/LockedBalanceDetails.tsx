import { LockUnlockLineIcon } from '@webb-tools/icons';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import useDemocracy from '../../hooks/useDemocracy';
import useStaking from '../../hooks/useStaking';
import useVesting from '../../hooks/useVesting';
import BalanceAction from './BalanceAction';
import BalanceCell from './BalanceCell';
import HeaderCell from './HeaderCell';

/** @internal */
const LockedBalanceDetails: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt } = useVesting();
  const { executeVestTx } = useVesting();

  const {
    lockedBalance: democracyBalance,
    latestReferendum: latestDemocracyReferendum,
  } = useDemocracy();

  const hasDemocracyLockedBalance =
    democracyBalance !== null && democracyBalance.gtn(0);

  const democracyLockEndBlock =
    latestDemocracyReferendum !== null && latestDemocracyReferendum.isOngoing
      ? latestDemocracyReferendum.asOngoing.end
      : null;

  const { lockedBalance: stakingBalance } = useStaking();

  const hasStakingLockedBalance =
    stakingBalance !== null && stakingBalance.gtn(0);

  const vestingSchedulesLabels =
    vestingSchedulesOpt !== null &&
    !vestingSchedulesOpt.isNone &&
    vestingSchedulesOpt
      .unwrap()
      .map((_schedule, index) => (
        <SmallPurpleChip key={index} title="Vesting" />
      ));

  const vestingSchedulesBalances =
    vestingSchedulesOpt !== null &&
    vestingSchedulesOpt.isSome &&
    vestingSchedulesOpt.unwrap().map((schedule, index) => (
      <div key={index} className="flex flex-row justify-between items-center">
        <BalanceCell amount={schedule.locked} />

        <BalanceAction
          Icon={LockUnlockLineIcon}
          onClick={executeVestTx}
          tooltip={
            <>
              Unlock this balance by performing a <strong>vest</strong>{' '}
              transaction.
            </>
          }
        />
      </div>
    ));

  const vestingSchedulesUnlockingAt =
    vestingSchedulesOpt !== null &&
    !vestingSchedulesOpt.isNone &&
    vestingSchedulesOpt.unwrap().map((schedule, index) => {
      const endingBlockNumber = schedule.startingBlock.add(
        schedule.locked.div(schedule.perBlock)
      );

      return <TextCell key={index} text={`Block #${endingBlockNumber}`} />;
    });

  const democracyUnlockingAt = hasDemocracyLockedBalance && (
    <TextCell
      text={
        democracyLockEndBlock !== null ? '—' : `Block #${democracyLockEndBlock}`
      }
    />
  );

  const stakingUnlockingAt = hasStakingLockedBalance && (
    <TextCell text={`Block #100 / Era #90`} />
  );

  return (
    <div className="flex flex-row bg-glass dark:bg-none dark:bg-mono-180 px-3 py-2 rounded-lg">
      <div className="flex flex-row w-full">
        {/* Type */}
        <div className="flex flex-col gap-6 w-full items-start">
          <div className="self-stretch">
            <HeaderCell title="Lock Type" />
          </div>

          {vestingSchedulesLabels}

          {hasDemocracyLockedBalance && <SmallPurpleChip title="Democracy" />}

          {hasStakingLockedBalance && <SmallPurpleChip title="Nomination" />}
        </div>

        {/* Unlocks at */}
        <div className="flex flex-col gap-6 w-full">
          <HeaderCell title="Unlocks At" />

          {vestingSchedulesUnlockingAt}

          {democracyUnlockingAt}

          {stakingUnlockingAt}
        </div>
      </div>

      {/* Balances */}
      <div className="flex flex-col gap-6 w-full">
        <HeaderCell title="Balance" />

        {vestingSchedulesBalances}

        {hasDemocracyLockedBalance && <BalanceCell amount={democracyBalance} />}

        {hasStakingLockedBalance && <BalanceCell amount={stakingBalance} />}
      </div>
    </div>
  );
};

/** @internal */
const SmallPurpleChip: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="p-3">
      <div className="bg-purple-10 dark:bg-purple-120 rounded-3xl px-4 py-1">
        <Typography
          variant="body2"
          fw="semibold"
          className="uppercase text-purple-60 dark:text-purple-50"
        >
          {title}
        </Typography>
      </div>
    </div>
  );
};

/** @internal */
const TextCell: FC<{
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

export default LockedBalanceDetails;
