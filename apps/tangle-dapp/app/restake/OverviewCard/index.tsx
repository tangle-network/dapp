import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import {
  type ComponentProps,
  type ElementRef,
  FC,
  forwardRef,
  useMemo,
} from 'react';

import { InfoIconWithTooltip } from '../../../components/InfoIconWithTooltip';
import TangleCard from '../../../components/TangleCard';
import { TANGLE_TOKEN_UNIT } from '../../../constants';
import ActionButton from './ActionButton';

type OverviewCardProps = ComponentProps<'div'> & {
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
      ...props
    },
    ref
  ) => {
    const hasProfile = useMemo(
      () =>
        typeof totalRestaked === 'number' ||
        typeof availableForRestake === 'number',
      [availableForRestake, totalRestaked]
    );

    return (
      <TangleCard {...props} className="h-[300px] md:max-w-none" ref={ref}>
        <div className="grid content-between w-full h-full grid-cols-2">
          <StatsItem
            isLoading={isLoading}
            title="Total Restaked"
            value={totalRestaked}
            isBoldText
            prefix={TANGLE_TOKEN_UNIT}
          />

          <StatsItem
            isLoading={isLoading}
            title="Available for Restake"
            value={availableForRestake}
            isBoldText
            prefix={TANGLE_TOKEN_UNIT}
          />

          <StatsItem
            isLoading={isLoading}
            title="Earnings"
            value={hasProfile ? earnings : null}
            prefix={TANGLE_TOKEN_UNIT}
          />
          <StatsItem isLoading={isLoading} title="APY" value={apy} prefix="%" />

          <ActionButton hasProfile={hasProfile} />
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
  value: number | null;
  valueTooltip?: string;
  isBoldText?: boolean;
  prefix?: string;
  isLoading?: boolean;
};

const StatsItem: FC<StatsItemProps> = ({
  title,
  titleTooltip,
  value,
  valueTooltip,
  isBoldText,
  prefix = '',
  isLoading,
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
              {`${
                typeof value === 'number' ? value.toLocaleString() : '--'
              } ${prefix}`.trim()}
            </Typography>

            {valueTooltip && <InfoIconWithTooltip content={valueTooltip} />}
          </>
        )}
      </div>
    </div>
  );
};
