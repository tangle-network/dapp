import { BN } from '@polkadot/util';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config/constants';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config/constants/tangle';
import { KeyStatsItem } from '@tangle-network/ui-components/components/Stats/KeyStatsItem';
import { Typography } from '@tangle-network/ui-components/typography';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components/utils/formatDisplayAmount';
import { useMemo } from 'react';
import useActiveAccountReward from '../../data/rewards/useActiveAccountReward';
import ClaimRewardAction from './ClaimRewardAction';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const AccountRewards = () => {
  const nativeTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

  const { data, error, isPending, refetch } = useActiveAccountReward();

  const claimableAssets = useMemo(() => {
    if (!data) {
      return null;
    }

    // Include only non-zero entries.
    return new Map(data.entries().filter(([_, value]) => value > ZERO_BIG_INT));
  }, [data]);

  const totalRewardsFormatted = useMemo(() => {
    if (!data) {
      return null;
    }

    const totalRewards = data
      .values()
      .reduce((acc, current) => acc + current, ZERO_BIG_INT);

    return formatDisplayAmount(
      new BN(totalRewards.toString()),
      TANGLE_TOKEN_DECIMALS,
      AmountFormatStyle.SHORT,
    );
  }, [data]);

  return (
    <KeyStatsItem
      className="!p-0"
      title="Unclaimed Rewards"
      hideErrorNotification
      isLoading={isPending}
      error={error}
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
            refetchReward={refetch}
          />
        ) : null}
      </div>
    </KeyStatsItem>
  );
};

export default AccountRewards;
