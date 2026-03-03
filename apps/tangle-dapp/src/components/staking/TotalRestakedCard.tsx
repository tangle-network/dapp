/**
 * Card displaying user's total restaked value and withdrawal status.
 * Follows EigenLayer-style dashboard design.
 */

import { FC } from 'react';
import { useNavigate } from 'react-router';
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
import { PagePath } from '../../types';

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

const TotalRestakedCard: FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useUserRestakingStats();

  const handleUndelegate = () => {
    navigate(PagePath.RESTAKE_UNDELEGATE);
  };

  const handleManageBalances = () => {
    navigate(PagePath.RESTAKE_WITHDRAW);
  };

  return (
    <Card
      variant={CardVariant.GLASS}
      className={twMerge(
        'p-6 flex flex-col gap-4',
        'border border-mono-60 dark:border-mono-160',
      )}
    >
      <div>
        <Typography
          variant="body2"
          className="text-mono-100 dark:text-mono-100 mb-1"
        >
          Total Value Restaked
        </Typography>

        {isLoading ? (
          <SkeletonLoader className="h-10 w-32" />
        ) : (
          <Typography variant="h3" fw="bold" className="!leading-tight">
            {stats?.formatted.totalDeposited ?? EMPTY_VALUE_PLACEHOLDER} TNT
          </Typography>
        )}
      </div>

      <div className="border-t border-mono-60 dark:border-mono-160 pt-3">
        <StatRow
          label="Withdraw queue"
          value={stats?.formatted.withdrawQueueAmount ?? '0'}
          isLoading={isLoading}
        />

        <StatRow
          label="Withdrawable"
          value={stats?.formatted.withdrawableAmount ?? '0'}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <Button
          variant="secondary"
          isFullWidth
          onClick={handleUndelegate}
          isDisabled={isLoading}
        >
          Undelegate
        </Button>

        <Button
          variant="secondary"
          isFullWidth
          onClick={handleManageBalances}
          isDisabled={isLoading}
        >
          Manage Balances
        </Button>
      </div>
    </Card>
  );
};

export default TotalRestakedCard;
