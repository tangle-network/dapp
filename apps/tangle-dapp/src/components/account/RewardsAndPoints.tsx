import { BN } from '@polkadot/util';
import {
  TANGLE_TOKEN_DECIMALS,
  ZERO_BIG_INT,
} from '@tangle-network/dapp-config';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components/utils/formatDisplayAmount';
import { useMemo } from 'react';
import useActivePoints from '../../data/points/useActivePoints';
import useAccountRewardInfo from '../../data/rewards/useAccountRewardInfo';
import { KeyStatsItem } from '@tangle-network/ui-components';
import ClaimRewardAction from './ClaimRewardAction';

const RewardsAndPoints = () => {
  const nativeTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

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
    if (rewards === null) {
      return null;
    }

    const totalRewards = rewards
      .values()
      .reduce((acc, current) => acc + current, ZERO_BIG_INT);

    return formatDisplayAmount(
      new BN(totalRewards.toString()),
      TANGLE_TOKEN_DECIMALS,
      AmountFormatStyle.SHORT,
    );
  }, [rewards]);

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
            {totalRewardsFormatted ?? 0}{' '}
          </Typography>

          <Typography
            variant="body1"
            className="text-mono-140 dark:text-mono-40"
            component="span"
          >
            {nativeTokenSymbol}
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
            {points?.account?.totalPoints === undefined
              ? EMPTY_VALUE_PLACEHOLDER
              : addCommasToNumber(points.account.totalPoints)}
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
