'use client';

import { ListCheckIcon, TimerLine } from '@webb-tools/icons';
import { FC } from 'react';

import PillCard from '../../app/account/PillCard';
import { SWR_ERA } from '../../constants';
import usePendingStakingRewards from '../../data/StakingStats/useStakingRewards';
import useFormattedBalance from '../../hooks/useFormattedBalance';
import usePolkadotApi from '../../hooks/usePolkadotApi';

const StakingStats: FC = () => {
  const { value: currentEra } = usePolkadotApi(SWR_ERA, (api) =>
    api.query.staking.currentEra().then((era) => era.toString())
  );

  const pendingRewards = usePendingStakingRewards();
  const formattedPendingRewards = useFormattedBalance(pendingRewards);

  return (
    <>
      <div className="flex flex-col md:flex-row">
        <PillCard
          isFirst
          title="Current Era"
          value={currentEra}
          Icon={TimerLine}
        />

        <PillCard
          isLast
          title="Pending Staking Rewards"
          value={formattedPendingRewards}
          Icon={ListCheckIcon}
        />
      </div>
    </>
  );
};

export default StakingStats;
