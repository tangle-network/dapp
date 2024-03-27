'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { type ComponentProps, type ElementRef, FC, forwardRef } from 'react';

import { InfoIconWithTooltip } from '../../../components/InfoIconWithTooltip';
import TangleCard from '../../../components/TangleCard';
import useNetworkStore from '../../../context/useNetworkStore';
import ActionButton from './ActionButton';

const OverviewCard = forwardRef<ElementRef<'div'>, ComponentProps<'div'>>(
  (props, ref) => {
    const { nativeTokenSymbol } = useNetworkStore();

    return (
      <TangleCard {...props} className="h-[300px] md:max-w-none" ref={ref}>
        <div className="grid content-between w-full h-full grid-cols-2">
          <StatsItem
            title="Total Restaked"
            value={null}
            isBoldText
            suffix={nativeTokenSymbol}
          />

          <StatsItem
            title="Available for Restake"
            value={null}
            isBoldText
            suffix={nativeTokenSymbol}
          />

          <StatsItem title="Earnings" value={null} suffix={nativeTokenSymbol} />

          <StatsItem title="APY" value={null} suffix="%" />

          <ActionButton />
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
  suffix?: string;
};

const StatsItem: FC<StatsItemProps> = ({
  title,
  titleTooltip,
  value,
  valueTooltip,
  isBoldText,
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
        <Typography
          variant="h4"
          fw={isBoldText ? 'bold' : 'normal'}
          className="text-mono-200 dark:text-mono-0"
        >
          {`${
            typeof value === 'number' ? value.toLocaleString() : '--'
          } ${suffix}`.trim()}
        </Typography>

        {valueTooltip && <InfoIconWithTooltip content={valueTooltip} />}
      </div>
    </div>
  );
};
