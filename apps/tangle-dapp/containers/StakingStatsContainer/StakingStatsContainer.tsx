'use client';

import { TimerLine } from '@webb-tools/icons';
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

  const totalRewards = rewards !== null ? rewards.totalRewards.toString() : '-';

  const claimedRewards =
    rewards !== null ? rewards.claimedRewards.toString() : '-';

  const pendingRewards =
    rewards !== null ? rewards.pendingRewards.toString() : '-';

  return (
    <>
      <div className="flex">
        <PillCard
          isFirst
          title="Current Era"
          value={currentEra || '-'}
          Icon={TimerLine}
        />

        <PillCard title="Total Rewards" value={totalRewards} Icon={TimerLine} />

        <PillCard
          title="Claimed Amount"
          value={claimedRewards}
          Icon={TimerLine}
        />

        <PillCard
          isLast
          title="Pending Rewards"
          value={pendingRewards}
          Icon={TimerLine}
        />
      </div>
    </>
  );
};

export default StakingStats;
