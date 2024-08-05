import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import { ParachainCurrency } from '../../../constants/liquidStaking';
import useTokenUnlockDurations from '../../../data/liquidStaking/useTokenUnlockDurations';
import stringifyTimeUnit from '../../../utils/liquidStaking/stringifyTimeUnit';
import DetailItem from './DetailItem';

export type UnstakePeriodDetailItemProps = {
  currency: ParachainCurrency;
};

const UnstakePeriodDetailItem: FC<UnstakePeriodDetailItemProps> = ({
  currency,
}) => {
  const unlockDurations = useTokenUnlockDurations();

  const unlockPeriod = useMemo<'Unknown' | [string, string] | null>(() => {
    if (unlockDurations === null) {
      return null;
    }

    const unlockDuration = unlockDurations.find(
      (entry) => entry.currency === currency && entry.isNative,
    );

    // Unlock duration is not set onchain.
    if (unlockDuration === undefined) {
      return 'Unknown' as const;
    }

    const parts = stringifyTimeUnit(unlockDuration.timeUnit);

    return [parts[0].toString(), parts[1]];
  }, [currency, unlockDurations]);

  const value =
    unlockPeriod === null ? (
      // Still fetching unlocking period.
      <SkeletonLoader className="max-w-[100px] min-w-4" />
    ) : typeof unlockPeriod !== 'string' ? (
      // Unlock period is set, and it is known.
      <div>
        <strong>{unlockPeriod[0]}</strong> {unlockPeriod[1]}
      </div>
    ) : (
      // Unlocking period is unknown because it is not set onchain.
      unlockPeriod
    );

  return (
    <DetailItem
      title="Unstake period"
      tooltip="The period of time you need to wait before you can unstake your tokens."
      value={value}
    />
  );
};

export default UnstakePeriodDetailItem;
