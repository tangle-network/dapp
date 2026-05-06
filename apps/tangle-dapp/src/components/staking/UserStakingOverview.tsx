import { FC, useMemo } from 'react';
import {
  Card,
  CardVariant,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { TokenIcon } from '@tangle-network/icons';
import type { Delegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import type { StakingAssetMap } from '@tangle-network/tangle-shared-ui/data/graphql';
import { formatUnits, Address } from 'viem';
import { twMerge } from 'tailwind-merge';

interface Props {
  delegator: Delegator | null;
  assets: StakingAssetMap | null;
  isLoading: boolean;
}

const formatBalance = (amount: bigint, decimals: number): string => {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.001) return '< 0.001';
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
};

export const UserStakingOverview: FC<Props> = ({
  delegator,
  assets,
  isLoading,
}) => {
  // Get position details for each asset
  const positions = useMemo(() => {
    if (!delegator || !assets) return [];
    return delegator.assetPositions
      .filter(
        (pos) =>
          pos.totalDeposited > BigInt(0) || pos.delegatedAmount > BigInt(0),
      )
      .map((pos) => {
        const asset = assets.get(pos.token as Address);
        return {
          token: pos.token,
          symbol: asset?.metadata.symbol ?? 'Unknown',
          decimals: asset?.metadata.decimals ?? 18,
          deposited: pos.totalDeposited,
          delegated: pos.delegatedAmount,
          locked: pos.lockedAmount,
        };
      });
  }, [delegator, assets]);

  // Get pending requests count
  const pendingCount = useMemo(() => {
    if (!delegator) return 0;
    return delegator.withdrawRequests.length + delegator.unstakeRequests.length;
  }, [delegator]);

  if (isLoading) {
    return <SkeletonLoader className="h-32" />;
  }

  // No positions - show empty state
  if (positions.length === 0) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6 text-center">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          No positions yet. Deposit assets to start staking.
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5" fw="bold">
          Your Positions
        </Typography>

        {pendingCount > 0 && (
          <Typography variant="body2" className="text-mono-100">
            {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
          </Typography>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 items-center">
        <div />
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-80 text-right pb-2"
        >
          Deposited
        </Typography>
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-80 text-right pb-2"
        >
          Delegated
        </Typography>

        {positions.map((pos, index) => (
          <div
            key={pos.token}
            className={twMerge(
              'col-span-3 grid grid-cols-subgrid items-center p-3 rounded-lg',
              'bg-mono-20/50 dark:bg-mono-180/50',
              index > 0 && 'mt-3',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10">
                <TokenIcon name={pos.symbol} size="xl" />
              </div>

              <div>
                <Typography variant="body1" fw="semibold">
                  {pos.symbol}
                </Typography>

                <Typography
                  variant="body2"
                  className="text-mono-120 dark:text-mono-80"
                >
                  {pos.token.slice(0, 6)}...{pos.token.slice(-4)}
                </Typography>
              </div>
            </div>

            <Typography variant="body1" fw="semibold" className="text-right">
              {formatBalance(pos.deposited, pos.decimals)}
            </Typography>

            <Typography
              variant="body1"
              className="text-mono-120 dark:text-mono-80 text-right"
            >
              {formatBalance(pos.delegated, pos.decimals)}
            </Typography>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UserStakingOverview;
