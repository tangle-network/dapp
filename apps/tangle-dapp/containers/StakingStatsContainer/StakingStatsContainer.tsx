'use client';

import { ListCheckIcon, TimerLine } from '@webb-tools/icons';
import { FC, useCallback } from 'react';

import PillCard from '../../components/account/PillCard';
import useNetworkStore from '../../context/useNetworkStore';
import useStakingPendingRewards from '../../data/staking/useStakingPendingRewards';
import usePolkadotApi, { PolkadotApiSwrKey } from '../../hooks/usePolkadotApi';
import { formatTokenBalance } from '../../utils/polkadot/tokens';

const StakingStatsContainer: FC = () => {
  const { value: currentEra } = usePolkadotApi<string | null>(
    useCallback(
      // TODO: Find out under what conditions can `eraOpt` be `None` and handle it. Will need to search in the Substrate codebase for this. Make sure to write a comment explaining the conditions under which `eraOpt` can be `None` here, once it's found.
      (api) =>
        api.query.staking.currentEra().then((eraOpt) => eraOpt.toString()),
      []
    ),
    PolkadotApiSwrKey.ERA
  );

  const pendingRewards = useStakingPendingRewards();
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedPendingRewards =
    pendingRewards !== null
      ? formatTokenBalance(pendingRewards, nativeTokenSymbol)
      : null;

  return (
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
  );
};

export default StakingStatsContainer;
