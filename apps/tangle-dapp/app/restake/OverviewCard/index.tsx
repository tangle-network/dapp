'use client';

import { BN_ZERO } from '@polkadot/util';
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
import useRestakingLimits from '../../../data/restaking/useRestakingLimits';
import useRestakingProfile from '../../../data/restaking/useRestakingProfile';
import useFormatNativeTokenAmount from '../../../hooks/useFormatNativeTokenAmount';
import { getTotalRestakedFromRestakeRoleLedger } from '../../../utils/polkadot/restake';
import ActionButton from './ActionButton';

const OverviewCard = forwardRef<ElementRef<'div'>, ComponentProps<'div'>>(
  (props, ref) => {
    const formatNativeTokenAmount = useFormatNativeTokenAmount();
    const {
      hasExistingProfile,
      profileTypeOpt,
      earningsRecord,
      ledgerOpt,
      isLoading,
    } = useRestakingProfile();
    const { maxRestakingAmount } = useRestakingLimits();

    const totalRestaked = useMemo(
      () => getTotalRestakedFromRestakeRoleLedger(ledgerOpt),
      [ledgerOpt]
    );

    const earnings = useMemo(() => {
      if (isLoading || !earningsRecord) return null;

      return Object.values(earningsRecord).reduce(
        (total, curr) => total.add(curr),
        BN_ZERO
      );
    }, [earningsRecord, isLoading]);

    const availableForRestake = useMemo(() => {
      if (maxRestakingAmount !== null && totalRestaked !== null) {
        return maxRestakingAmount.gt(totalRestaked)
          ? maxRestakingAmount.sub(totalRestaked)
          : BN_ZERO;
      }

      return maxRestakingAmount;
    }, [maxRestakingAmount, totalRestaked]);

    return (
      <TangleCard {...props} className="h-[300px] md:max-w-none" ref={ref}>
        <div className="grid content-between w-full h-full grid-cols-2">
          <StatsItem
            isLoading={isLoading}
            title="Total Restaked"
            value={
              totalRestaked ? formatNativeTokenAmount(totalRestaked) : null
            }
            isBoldText
          />

          <StatsItem
            isLoading={isLoading}
            title="Available for Restake"
            value={
              availableForRestake
                ? formatNativeTokenAmount(availableForRestake)
                : null
            }
            isBoldText
          />

          <StatsItem
            isLoading={isLoading}
            title="Earnings"
            value={
              hasExistingProfile && earnings
                ? formatNativeTokenAmount(earnings)
                : null
            }
          />

          <StatsItem isLoading={isLoading} title="APY" value={null} />

          <ActionButton
            hasExistingProfile={hasExistingProfile}
            profileTypeOpt={profileTypeOpt}
            dataLoading={isLoading}
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
  value: string | null;
  valueTooltip?: string;
  isBoldText?: boolean;
  isLoading?: boolean;
};

const StatsItem: FC<StatsItemProps> = ({
  title,
  titleTooltip,
  value,
  valueTooltip,
  isBoldText,
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
              {value ?? '--'}
            </Typography>

            {valueTooltip && <InfoIconWithTooltip content={valueTooltip} />}
          </>
        )}
      </div>
    </div>
  );
};
