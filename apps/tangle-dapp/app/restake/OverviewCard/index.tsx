'use client';

import { formatBalance } from '@polkadot/util';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { type ComponentProps, type ElementRef, FC, forwardRef } from 'react';

import { InfoIconWithTooltip } from '../../../components/InfoIconWithTooltip';
import TangleCard from '../../../components/TangleCard';
import useNetworkStore from '../../../context/useNetworkStore';
import { RestakingProfileType } from '../../../types';
import Optional from '../../../utils/Optional';
import ActionButton from './ActionButton';

type OverviewCardProps = ComponentProps<'div'> & {
  hasExistingProfile: boolean | null;
  profileTypeOpt: Optional<RestakingProfileType> | null;
  isLoading?: boolean;
  totalRestaked?: number | null;
  availableForRestake?: number | null;
  earnings?: number | null;
  apy?: number | null;
};

const OverviewCard = forwardRef<ElementRef<'div'>, OverviewCardProps>(
  (
    {
      isLoading,
      totalRestaked = null,
      availableForRestake = null,
      earnings = null,
      apy = null,
      hasExistingProfile,
      profileTypeOpt,
      ...props
    },
    ref
  ) => {
    const { nativeTokenSymbol } = useNetworkStore();

    return (
      <TangleCard {...props} className="h-[300px] md:max-w-none" ref={ref}>
        <div className="grid content-between w-full h-full grid-cols-2">
          <StatsItem
            isLoading={isLoading}
            title="Total Restaked"
            value={totalRestaked}
            isBoldText
            suffix={nativeTokenSymbol}
          />

          <StatsItem
            isLoading={isLoading}
            title="Available for Restake"
            value={availableForRestake}
            isBoldText
            suffix={nativeTokenSymbol}
          />

          <StatsItem
            isLoading={isLoading}
            title="Earnings"
            value={hasExistingProfile ? earnings : null}
            suffix={nativeTokenSymbol}
          />

          <StatsItem isLoading={isLoading} title="APY" value={apy} suffix="%" />

          <ActionButton
            hasExistingProfile={hasExistingProfile}
            profileTypeOpt={profileTypeOpt}
          />
        </div>
      </TangleCard>
    );
  }
);

OverviewCard.displayName = 'OverviewCard';

export default OverviewCard;

type StatsItemProps = {
  title: string;
  titleTooltip?: string;
  value: number | null | undefined;
  valueTooltip?: string;
  isBoldText?: boolean;
  isLoading?: boolean;
  suffix?: string;
};

const StatsItem: FC<StatsItemProps> = ({
  title,
  titleTooltip,
  value,
  valueTooltip,
  isBoldText,
  isLoading,
  suffix = '',
}) => {
  return (
    <div className="gap-3">
      <div className="flex items-center gap-1">
        <Typography
          variant="h5"
          fw={isBoldText ? 'bold' : 'normal'}
          className="text-mono-120 dark:text-mono-100"
        >
          {title}
        </Typography>

        {titleTooltip && <InfoIconWithTooltip content={titleTooltip} />}
      </div>

      <div className="flex items-center gap-1">
        {isLoading ? (
          <SkeletonLoader className="w-20 h-9" />
        ) : (
          <>
            <Typography
              variant="h4"
              fw={isBoldText ? 'bold' : 'normal'}
              className="text-mono-200 dark:text-mono-0"
            >
              {typeof value === 'string' || typeof value === 'number'
                ? formatBalance(value, {
                    withUnit: suffix,
                  })
                : '--'}
            </Typography>

            {valueTooltip && <InfoIconWithTooltip content={valueTooltip} />}
          </>
        )}
      </div>
    </div>
  );
};
