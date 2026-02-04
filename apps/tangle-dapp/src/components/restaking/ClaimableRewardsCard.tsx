/**
 * Card displaying user's claimable rewards and staking activity.
 * Follows EigenLayer-style dashboard design.
 */

import { FC, useCallback, useState } from 'react';
import {
  Card,
  CardVariant,
  Typography,
  Button,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import { twMerge } from 'tailwind-merge';
import useUserRestakingStats from '../../data/restaking/useUserRestakingStats';
import useClaimDelegatorRewardsTx from '../../data/restaking/useClaimDelegatorRewardsTx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

interface StatRowProps {
  label: string;
  value: string;
  symbol?: string;
  isLoading?: boolean;
}

const StatRow: FC<StatRowProps> = ({
  label,
  value,
  symbol = 'TNT',
  isLoading,
}) => (
  <div className="flex items-center justify-between py-2">
    <Typography variant="body2" className="text-mono-100 dark:text-mono-100">
      {label}
    </Typography>

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
  const { execute: claimRewards, status, reset } = useClaimDelegatorRewardsTx();
  const [isClaiming, setIsClaiming] = useState(false);

  const hasRewards = stats && stats.pendingRewards > BigInt(0);
  const isClaimingTx = status === TxStatus.PROCESSING;

  const handleClaimRewards = useCallback(async () => {
    if (!claimRewards || !hasRewards) {
      return;
    }

    setIsClaiming(true);
    try {
      await claimRewards();
      // Wait a bit then refetch stats
      setTimeout(() => {
        refetch();
        reset();
      }, 2000);
    } finally {
      setIsClaiming(false);
    }
  }, [claimRewards, hasRewards, refetch, reset]);

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

          {isLoading ? (
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

        {/* APR indicator - placeholder for future indexer data */}
        <div className="text-right">
          <Typography
            variant="body3"
            className="text-mono-100 dark:text-mono-100"
          >
            Last 7D APR
          </Typography>
          <Typography
            variant="body2"
            fw="medium"
            className="text-mono-120 dark:text-mono-80"
          >
            --
          </Typography>
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
          value="--"
          symbol=""
          isLoading={false}
        />
      </div>

      <Button
        isFullWidth
        onClick={handleClaimRewards}
        isDisabled={isLoading || !hasRewards || isClaimingTx || !claimRewards}
        isLoading={isClaiming || isClaimingTx}
        className="mt-2"
      >
        {isClaimingTx ? 'Claiming...' : 'Claim All Rewards'}
      </Button>
    </Card>
  );
};

export default ClaimableRewardsCard;
