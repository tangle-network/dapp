import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LsProtocolId } from '../../../constants/liquidStaking/types';
import CrossChainTime from '../../../utils/CrossChainTime';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import pluralize from '../../../utils/pluralize';
import DetailItem from './DetailItem';

export type UnstakePeriodDetailItemProps = {
  protocolId: LsProtocolId;
};

type UnstakePeriod = {
  value: number;
  unit: string;
  isEstimate: boolean;
};

const UnstakePeriodDetailItem: FC<UnstakePeriodDetailItemProps> = ({
  protocolId,
}) => {
  const protocol = getLsProtocolDef(protocolId);

  const unlockPeriod = ((): UnstakePeriod | null => {
    const unlockPeriod = new CrossChainTime(
      protocol.timeUnit,
      protocol.unstakingPeriod,
    );

    const days = unlockPeriod.toDays();
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
