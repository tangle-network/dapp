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

const RewardsAndPoints = () => {
  const [activeChain] = useActiveChain();

  const { result, error, refetch, isLoading } = useAccountRewardInfo();

  const claimableAssets = useMemo(() => {
    if (result === null) {
      return null;
    }

    return new Map(
      result.entries().filter(([_, value]) => value > ZERO_BIG_INT),
    );
  }, [result]);

  const totalRewardsFormatted = useMemo(() => {
    if (result === null || !activeChain) {
      return null;
    }

    const totalRewards = result
      .values()
      .reduce((acc, current) => acc + current, ZERO_BIG_INT);

    return formatDisplayAmount(
      new BN(totalRewards.toString()),
      activeChain.nativeCurrency.decimals,
      AmountFormatStyle.SHORT,
    );
  }, [activeChain, result]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <KeyStatsItem
        hideErrorNotification
        isLoading={isLoading}
        className="!p-0"
        title="Unclaimed Rewards"
        error={error}
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
              onPostClaim={refetch}
            />
          ) : null}
        </div>
      </KeyStatsItem>

      <KeyStatsItem className="!p-0" title="Earned Points" error={null}>
      <div className="flex items-baseline gap-2"> 

      <Typography
            variant="h4"
            fw="bold"
            className="text-mono-140 dark:text-mono-40"
            component="span"
          >
        0
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
