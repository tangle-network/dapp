'use client';

import { ListCheckIcon, LoopRightFillIcon, TimerLine } from '@webb-tools/icons';
import { FC } from 'react';

import PillCard from '../../app/account/PillCard';
import { SWR_ERA } from '../../constants';
import useStakingRewards from '../../data/StakingStats/useStakingRewards';
import usePolkadotApi from '../../hooks/usePolkadotApi';

const StakingStats: FC = () => {
  const { value: currentEra } = usePolkadotApi(SWR_ERA, (api) =>
    api.query.staking.currentEra().then((era) => era.toString())
  );

  const { value: rewards } = useStakingRewards();

  // TODO: Format as token balance.
  const totalRewards =
    rewards !== null ? rewards.totalRewards.toString() : null;

  // TODO: Format as token balance.
  const claimedRewards =
    rewards !== null ? rewards.claimedRewards.toString() : null;

  // TODO: Format as token balance.
  const pendingRewards =
    rewards !== null ? rewards.pendingRewards.toString() : null;

  return (
    <>
      <div className="flex flex-col md:flex-row">
        <PillCard
          isFirst
          title="Current Era"
          value={currentEra}
          Icon={TimerLine}
        />

        <PillCard title="Total Rewards" value={totalRewards} Icon={TimerLine} />

        <PillCard
          title="Claimed Amount"
          value={claimedRewards}
          Icon={LoopRightFillIcon}
        />

        <PillCard
          isLast
          title="Pending Rewards"
          value={pendingRewards}
          Icon={ListCheckIcon}
        />
      </div>
    </>
  );
};

export default StakingStats;
