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
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';

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

  const claimableAssets = useMemo(() => {
    if (rewards === null) {
      return null;
    }

    // Include only non-zero entries.
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

  const totalPoints = useMemo(() => {
    if (typeof points?.account?.totalPoints !== 'number') {
      return EMPTY_VALUE_PLACEHOLDER;
    }

    return addCommasToNumber(points.account.totalPoints);
  }, [points?.account?.totalPoints]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <KeyStatsItem
        className="!p-0"
        title="Unclaimed Rewards"
        hideErrorNotification
        isLoading={isRewardsLoading}
        error={rewardsError}
        tooltip="Rewards earned from deposits in restaking."
      >
        <div className="flex items-baseline gap-2">
          <Typography
            variant="h4"
            fw="bold"
            className="text-mono-140 dark:text-mono-40"
            component="span"
          >
            {totalRewardsFormatted ?? EMPTY_VALUE_PLACEHOLDER}{' '}
          </Typography>

          <Typography
            variant="body1"
            className="text-mono-140 dark:text-mono-40"
            component="span"
          >
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
        title="Points Earned"
        hideErrorNotification
        isLoading={isPointsLoading}
        error={pointsError}
        tooltip="Points earned toward airdrop through network participation."
      >
        <div className="flex items-baseline gap-2">
          <Typography
            variant="h4"
            fw="bold"
            className="text-mono-140 dark:text-mono-40"
            component="span"
          >
            {totalPoints}
          </Typography>

          <Typography
            variant="body1"
            className="text-mono-140 dark:text-mono-40"
            component="span"
          >
            XP
          </Typography>
        </div>
      </KeyStatsItem>
    </div>
  );
};

export default RewardsAndPoints;
