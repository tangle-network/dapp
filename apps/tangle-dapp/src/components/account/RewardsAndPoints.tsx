import { BN } from '@polkadot/util';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@webb-tools/webb-ui-components/utils/formatDisplayAmount';
import { useMemo } from 'react';
import useAccountRewardInfo from '../../data/rewards/useAccountRewardInfo';
import KeyStatsItem from '../KeyStatsItem/KeyStatsItem';
import ClaimRewardAction from './ClaimRewardAction';
import useActivePoints from '../../data/points/useActivePoints';

const RewardsAndPoints = () => {
  const [activeChain] = useActiveChain();

  const {
    result: rewards,
    error: rewardsError,
    refetch: refreshRewards,
    isLoading: isRewardsLoading,
  } = useAccountRewardInfo();

  const {
    data: points,
    error: pointsError,
    isLoading: isPointsLoading,
  } = useActivePoints();

  console.log({
    points,
    pointsError,
    isPointsLoading,
  });

  const claimableAssets = useMemo(() => {
    if (rewards === null) {
      return null;
    }

    return new Map(
      rewards.entries().filter(([_, value]) => value > ZERO_BIG_INT),
    );
  }, [rewards]);

  const totalRewardsFormatted = useMemo(() => {
    if (rewards === null || !activeChain) {
      return null;
    }

    const totalRewards = rewards
      .values()
      .reduce((acc, current) => acc + current, ZERO_BIG_INT);

    return formatDisplayAmount(
      new BN(totalRewards.toString()),
      activeChain.nativeCurrency.decimals,
      AmountFormatStyle.SHORT,
    );
  }, [activeChain, rewards]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <KeyStatsItem
        className="!p-0"
        title="Unclaimed Rewards"
        hideErrorNotification
        isLoading={isRewardsLoading}
        error={rewardsError}
      >
        <div className="flex items-baseline gap-2">
          <Typography
            variant="h4"
            fw="bold"
            className="text-mono-140 dark:text-mono-40"
          >
            {totalRewardsFormatted ?? EMPTY_VALUE_PLACEHOLDER}{' '}
            {activeChain?.nativeCurrency.symbol}
          </Typography>

          {claimableAssets !== null && claimableAssets.size > 0 ? (
            <ClaimRewardAction
              claimableAssets={claimableAssets}
              onPostClaim={refreshRewards}
            />
          ) : null}
        </div>
      </KeyStatsItem>

      <KeyStatsItem
        className="!p-0"
        title="Earned Points"
        hideErrorNotification
        isLoading={isPointsLoading}
        error={pointsError}
      >
        {points?.account?.totalPoints ?? EMPTY_VALUE_PLACEHOLDER} XP
      </KeyStatsItem>
    </div>
  );
};

export default RewardsAndPoints;
