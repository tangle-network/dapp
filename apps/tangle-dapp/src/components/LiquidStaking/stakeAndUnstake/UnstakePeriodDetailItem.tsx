import { SkeletonLoader } from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { FC } from 'react';

import DetailItem from './DetailItem';

type UnstakePeriod = {
  value: number;
  unit: string;
  isEstimate: boolean;
};

const UnstakePeriodDetailItem: FC = () => {
  const unlockPeriod = ((): UnstakePeriod | null => {
    // TODO: This is actually in eras, not days. May need conversion.
    const days = protocol.unstakingPeriod;

    const roundedDays = Math.round(days);

    return {
      // TODO: Does 0 days mean it's past or unlocking today?
      unit: days === 0 ? 'today' : pluralize('day', days > 1),
      value: roundedDays,
      isEstimate: days !== roundedDays,
    };
  })();

  const value =
    unlockPeriod === null ? (
      // Still fetching unlocking period.
      <SkeletonLoader className="max-w-[100px] min-w-4" />
    ) : (
      <div>
        {unlockPeriod.isEstimate && '~'}
        <strong>{unlockPeriod.value.toString()}</strong> {unlockPeriod.unit}
      </div>
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
