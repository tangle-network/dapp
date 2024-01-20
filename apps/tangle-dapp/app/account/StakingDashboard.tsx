'use client';

import { TimerLine } from '@webb-tools/icons';
import { FC } from 'react';

import { SWR_STAKING_ERA } from '../../constants';
import usePolkadotApiValue from '../../hooks/usePolkadotApiValue';
import PillCard from './PillCard';

const StakingDashboard: FC = () => {
  const { value: currentEra } = usePolkadotApiValue(SWR_STAKING_ERA, (api) =>
    api.query.staking.currentEra()
  );

  // const { value: totalRewards } = usePolkadotApiValue((api) =>
  //   Promise.resolve(Math.random() * 1000)
  // );

  // const { value: claimedRewards } = usePolkadotApiValue((api) =>
  //   Promise.resolve(Math.random() * 1000)
  // );

  // const { value: pendingRewards } = usePolkadotApiValue((api) =>
  //   Promise.resolve(Math.random() * 1000)
  // );

  return (
    <>
      <div className="flex">
        <PillCard
          isFirst
          title="Current Era"
          value={currentEra !== null ? currentEra.toString() : '-'}
          Icon={TimerLine}
        />

        {/* <PillCard
          title="Total Rewards"
          value={totalRewards !== null ? `${totalRewards} ${TOKEN_UNIT}` : '-'}
          Icon={TimerLine}
        />

        <PillCard
          title="Claimed Amount"
          value={
            claimedRewards !== null ? `${claimedRewards} ${TOKEN_UNIT}` : '-'
          }
          Icon={TimerLine}
        />

        <PillCard
          isLast
          title="Pending Rewards"
          value={
            pendingRewards !== null ? `${pendingRewards} ${TOKEN_UNIT}` : '-'
          }
          Icon={TimerLine}
        /> */}
      </div>
    </>
  );
};

export default StakingDashboard;
