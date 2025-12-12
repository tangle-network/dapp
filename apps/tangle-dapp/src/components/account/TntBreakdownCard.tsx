import { FC } from 'react';
import {
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
  InfoIconWithTooltip,
} from '@tangle-network/ui-components';
import { twMerge } from 'tailwind-merge';

interface MetricProps {
  label: string;
  value: string;
  symbol: string;
  helper?: string;
  isLoading: boolean;
  subLabel?: string;
  subValue?: string;
}

const Metric: FC<MetricProps> = ({
  label,
  value,
  symbol,
  helper,
  isLoading,
  subLabel,
  subValue,
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1">
      <Typography variant="body2" className="text-mono-140 dark:text-mono-80">
        {label}
      </Typography>
      {helper ? <InfoIconWithTooltip content={helper} /> : null}
    </div>

    {isLoading ? (
      <SkeletonLoader className="h-8 w-24" />
    ) : (
      <div className="flex items-end gap-2">
        <Typography
          variant="h4"
          fw="bold"
          className="!leading-none text-mono-200 dark:text-mono-0"
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          className="pb-1 uppercase text-mono-140 dark:text-mono-80"
        >
          {symbol}
        </Typography>
      </div>
    )}

    {subLabel && subValue && (
      <Typography variant="body3" className="text-mono-130 dark:text-mono-80">
        {subLabel}:{' '}
        <span className="text-mono-200 dark:text-mono-20">{subValue}</span>
      </Typography>
    )}
  </div>
);

export interface TntBreakdownCardProps {
  symbol: string;
  walletValue: string;
  restakedValue: string;
  delegatedValue: string;
  availableValue: string;
  rewardsValue: string;
  isLoading: boolean;
  className?: string;
}

const TntBreakdownCard: FC<TntBreakdownCardProps> = ({
  symbol,
  walletValue,
  restakedValue,
  delegatedValue,
  availableValue,
  rewardsValue,
  isLoading,
  className,
}) => {
  return (
    <Card
      variant={CardVariant.GLASS}
      className={twMerge(
        'p-6 flex flex-col gap-5 border border-mono-60 dark:border-mono-160',
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Metric
          label="Your TNT"
          value={walletValue}
          symbol={symbol}
          helper="Liquid TNT available in your wallet"
          isLoading={isLoading}
        />

        <Metric
          label="Your Restaked TNT"
          value={restakedValue}
          symbol={symbol}
          helper="Total TNT currently deposited into restaking"
          isLoading={isLoading}
          subLabel="Delegated / Available"
          subValue={`${delegatedValue} / ${availableValue}`}
        />

        <Metric
          label="TNT Rewards"
          value={rewardsValue}
          symbol={symbol}
          helper="Unclaimed TNT rewards earned from delegations"
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
};

export default TntBreakdownCard;
