import { FC, useMemo } from 'react';
import {
  Card,
  CardVariant,
  EMPTY_VALUE_PLACEHOLDER,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import type { Delegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import type { RestakeAssetMap } from '@tangle-network/tangle-shared-ui/data/graphql/useRestakeAssets';
import { formatUnits, Address } from 'viem';
import { twMerge } from 'tailwind-merge';

interface Props {
  delegator: Delegator | null;
  assets: RestakeAssetMap | null;
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

export const UserRestakingOverview: FC<Props> = ({
  delegator,
  assets,
  isLoading,
}) => {
  // Calculate total deposited value
  const totalDeposited = useMemo(() => {
    if (!delegator) return BigInt(0);
    return delegator.totalDeposited;
  }, [delegator]);

  // Calculate total delegated value
  const totalDelegated = useMemo(() => {
    if (!delegator) return BigInt(0);
    return delegator.totalDelegated;
  }, [delegator]);

  // Get pending withdrawals count
  const pendingWithdrawals = useMemo(() => {
    if (!delegator) return 0;
    return delegator.withdrawRequests.length + delegator.unstakeRequests.length;
  }, [delegator]);

  // Get position details for each asset
  const positions = useMemo(() => {
    if (!delegator || !assets) return [];
    return delegator.assetPositions.map((pos) => {
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonLoader className="h-32" />
        <SkeletonLoader className="h-32" />
        <SkeletonLoader className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Deposited"
          value={
            totalDeposited > 0
              ? formatBalance(totalDeposited, 18)
              : EMPTY_VALUE_PLACEHOLDER
          }
          suffix="ETH"
        />
        <SummaryCard
          label="Total Delegated"
          value={
            totalDelegated > 0
              ? formatBalance(totalDelegated, 18)
              : EMPTY_VALUE_PLACEHOLDER
          }
          suffix="ETH"
        />
        <SummaryCard
          label="Pending Withdrawals"
          value={pendingWithdrawals > 0 ? String(pendingWithdrawals) : '0'}
        />
      </div>

      {/* Position Details */}
      {positions.length > 0 && (
        <Card variant={CardVariant.GLASS} className="p-4">
          <Typography variant="h5" fw="bold" className="mb-4">
            Your Positions
          </Typography>
          <div className="space-y-3">
            {positions.map((pos) => (
              <div
                key={pos.token}
                className={twMerge(
                  'flex justify-between items-center p-3 rounded-lg',
                  'bg-mono-20/50 dark:bg-mono-180/50',
                )}
              >
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
                <div className="text-right">
                  <Typography variant="body1" fw="semibold">
                    {formatBalance(pos.deposited, pos.decimals)} deposited
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-mono-120 dark:text-mono-80"
                  >
                    {formatBalance(pos.delegated, pos.decimals)} delegated
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!delegator && (
        <Card variant={CardVariant.GLASS} className="p-6 text-center">
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-80"
          >
            No positions yet. Deposit assets to start restaking.
          </Typography>
        </Card>
      )}
    </div>
  );
};

const SummaryCard: FC<{
  label: string;
  value: string;
  suffix?: string;
}> = ({ label, value, suffix }) => {
  return (
    <Card variant={CardVariant.GLASS} className="p-4">
      <Typography variant="body2" className="text-mono-120 dark:text-mono-80">
        {label}
      </Typography>
      <div className="flex items-baseline gap-2 mt-1">
        <Typography variant="h4" fw="bold">
          {value}
        </Typography>
        {suffix && (
          <Typography variant="body1" className="text-mono-100">
            {suffix}
          </Typography>
        )}
      </div>
    </Card>
  );
};

export default UserRestakingOverview;
