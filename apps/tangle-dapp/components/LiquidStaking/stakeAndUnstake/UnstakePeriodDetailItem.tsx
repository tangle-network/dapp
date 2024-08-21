import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LsProtocolId } from '../../../constants/liquidStaking/types';
import CrossChainTime from '../../../utils/CrossChainTime';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import DetailItem from './DetailItem';

export type UnstakePeriodDetailItemProps = {
  protocolId: LsProtocolId;
};

const UnstakePeriodDetailItem: FC<UnstakePeriodDetailItemProps> = ({
  protocolId,
}) => {
  const protocol = getLsProtocolDef(protocolId);

  const unlockPeriod = ((): [number, string] | null => {
    const unlockPeriod = new CrossChainTime(
      protocol.timeUnit,
      protocol.unstakingPeriod,
    );

    const days = unlockPeriod.toDays();

    // TODO: Special case for 0 days?
    const plurality = days > 1 ? 'days' : 'day';

    return [days, plurality];
  })();

  const value =
    unlockPeriod === null ? (
      // Still fetching unlocking period.
      <SkeletonLoader className="max-w-[100px] min-w-4" />
    ) : (
      <div>
        <strong>{unlockPeriod[0].toString()}</strong> {unlockPeriod[1]}
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
