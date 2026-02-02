/**
 * Card displaying user's claimable rewards and staking activity.
 * Follows EigenLayer-style dashboard design.
 */

import { FC, useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardVariant,
  Typography,
  Button,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
  InfoIconWithTooltip,
} from '@tangle-network/ui-components';
import { twMerge } from 'tailwind-merge';
import useUserRestakingStats from '../../data/restaking/useUserRestakingStats';
import {
  usePendingRewards,
  useClaimRewardsTx,
  useExpectedRewards,
} from '../../data/rewards';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

interface StatRowProps {
  label: string;
  value: string;
  symbol?: string;
  isLoading?: boolean;
  tooltip?: string;
}

const StatRow: FC<StatRowProps> = ({
  label,
  value,
  symbol = 'TNT',
  isLoading,
  tooltip,
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-1">
      <Typography variant="body2" className="text-mono-100 dark:text-mono-100">
        {label}
      </Typography>

      {tooltip && <InfoIconWithTooltip content={tooltip} />}
    </div>

    {isLoading ? (
      <SkeletonLoader className="h-5 w-20" />
    ) : (
      <Typography
        variant="body2"
        fw="medium"
        className="text-mono-200 dark:text-mono-0"
      >
        {value} {symbol}
      </Typography>
    )}
  </div>
);

const ClaimableRewardsCard: FC = () => {
  const { data: stats, isLoading, refetch } = useUserRestakingStats();
  const {
    data: pendingRewardsData,
    isLoading: isPendingRewardsLoading,
    refetch: refetchPendingRewards,
  } = usePendingRewards();
  const {
    data: expectedRewards,
    isLoading: isExpectedRewardsLoading,
    refetch: refetchExpectedRewards,
  } = useExpectedRewards();
  const { execute: claimRewards, status, reset } = useClaimRewardsTx();
  const [isClaiming, setIsClaiming] = useState(false);

  const hasRewards = stats && stats.pendingRewards > BigInt(0);
  const isClaimingTx = status === TxStatus.PROCESSING;

  // Get the first vault with rewards for claiming (simplest case)
  // In production, you might want to claim from all vaults
  const claimableVault = useMemo(() => {
    if (!pendingRewardsData?.vaults || pendingRewardsData.vaults.length === 0) {
      return null;
    }
    return pendingRewardsData.vaults[0];
  }, [pendingRewardsData]);

  const handleClaimRewards = useCallback(async () => {
    if (!claimRewards || !hasRewards || !claimableVault) {
      return;
    }

    setIsClaiming(true);
    try {
      // Claim from the first vault's operators
      const operators = claimableVault.rewards.map((r) => r.operator);
      await claimRewards({
        asset: claimableVault.asset,
        operators,
      });
      // Wait a bit then refetch stats
      setTimeout(() => {
        refetch();
        refetchPendingRewards();
        refetchExpectedRewards();
        reset();
      }, 2000);
    } finally {
      setIsClaiming(false);
    }
  }, [
    claimRewards,
    hasRewards,
    claimableVault,
    refetch,
    refetchPendingRewards,
    refetchExpectedRewards,
    reset,
  ]);

  // Determine what to show for APY
  const apyDisplay = useMemo(() => {
    if (isExpectedRewardsLoading) {
      return null; // Will show skeleton
    }
    if (!expectedRewards) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    if (expectedRewards.hasNoStake) {
      return '--';
    }
    if (expectedRewards.isPoolDepleted) {
      return '0%';
    }
    return expectedRewards.formattedApyRange;
  }, [expectedRewards, isExpectedRewardsLoading]);

  // Determine what to show for upcoming rewards
  const upcomingRewardsDisplay = useMemo(() => {
    if (isExpectedRewardsLoading) {
      return null; // Will show skeleton
    }
    if (!expectedRewards) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    if (expectedRewards.hasNoStake) {
      return '--';
    }
    if (expectedRewards.isPoolDepleted) {
      return '0';
    }
    return expectedRewards.formattedProjectedNextEpoch;
  }, [expectedRewards, isExpectedRewardsLoading]);

  return (
    <Card
      variant={CardVariant.GLASS}
      className={twMerge(
        'p-6 flex flex-col gap-4',
        'border border-mono-60 dark:border-mono-160',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <Typography
            variant="body2"
            className="text-mono-100 dark:text-mono-100 mb-1"
          >
            Claimable Reward Value
          </Typography>

          {isLoading || isPendingRewardsLoading ? (
            <SkeletonLoader className="h-10 w-32" />
          ) : (
            <Typography
              variant="h3"
              fw="bold"
              className={twMerge(
                '!leading-tight',
                hasRewards && 'text-green-50 dark:text-green-50',
              )}
            >
              {stats?.formatted.pendingRewards ?? EMPTY_VALUE_PLACEHOLDER} TNT
            </Typography>
          )}
        </div>

        {/* APY indicator */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Typography
              variant="body3"
              className="text-mono-100 dark:text-mono-100"
            >
              Est. APY
            </Typography>

            <InfoIconWithTooltip
              content="Estimated based on current stake and pool allocation. Range reflects no lock (1.0x) to 6-month lock (1.6x) boost. Actual rewards may vary."
            />
          </div>

          {isExpectedRewardsLoading ? (
            <SkeletonLoader className="h-5 w-20 ml-auto" />
          ) : (
            <Typography
              variant="body2"
              fw="medium"
              className={twMerge(
                'text-mono-120 dark:text-mono-80',
                apyDisplay !== '--' &&
                  apyDisplay !== EMPTY_VALUE_PLACEHOLDER &&
                  apyDisplay !== '0%' &&
                  'text-green-50 dark:text-green-50',
              )}
            >
              {apyDisplay}
            </Typography>
          )}
        </div>
      </div>

      <div className="border-t border-mono-60 dark:border-mono-160 pt-3">
        <StatRow
          label="Active balance"
          value={stats?.formatted.activeBalance ?? '0'}
          isLoading={isLoading}
        />

        <StatRow
          label="Upcoming rewards"
          value={upcomingRewardsDisplay ?? ''}
          symbol={upcomingRewardsDisplay === '--' ? '' : 'TNT'}
          isLoading={isExpectedRewardsLoading}
          tooltip="Projected rewards for the next epoch based on your current stake share."
        />
      </div>

      <Button
        isFullWidth
        onClick={handleClaimRewards}
        isDisabled={
          isLoading ||
          isPendingRewardsLoading ||
          !hasRewards ||
          isClaimingTx ||
          !claimRewards ||
          !claimableVault
        }
        isLoading={isClaiming || isClaimingTx}
        className="mt-2"
      >
        {isClaimingTx ? 'Claiming...' : 'Claim Rewards'}
      </Button>
    </Card>
  );
};

export default ClaimableRewardsCard;
