import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import {
  getLsProtocolDef,
  LsProtocolId,
} from '../../../constants/liquidStaking/types';
import useTokenUnlockDurations from '../../../data/liquidStaking/useTokenUnlockDurations';
import CrossChainTime from '../../../utils/CrossChainTime';
import stringifyTimeUnit from '../../../utils/liquidStaking/stringifyTimeUnit';
import DetailItem from './DetailItem';

export type UnstakePeriodDetailItemProps = {
  protocolId: LsProtocolId;
};

const UnstakePeriodDetailItem: FC<UnstakePeriodDetailItemProps> = ({
  protocolId,
}) => {
  type UnlockPeriodParts = 'Unknown' | [number, string] | null;

  const unlockDurations = useTokenUnlockDurations();

  const protocol = getLsProtocolDef(protocolId);
  const parachainCurrency = protocol.type === 'parachain' && protocol.currency;

  const parachainUnlockPeriod = useMemo<UnlockPeriodParts>(() => {
    if (unlockDurations === null || parachainCurrency === undefined) {
      return null;
    }

    const unlockDuration = unlockDurations.find(
      (entry) => entry.currency === parachainCurrency && entry.isNative,
    );

    // Unlock duration is not set onchain.
    if (unlockDuration === undefined) {
      return 'Unknown' as const;
    }

    const parts = stringifyTimeUnit(unlockDuration.timeUnit);

    return [parts[0], parts[1]];
  }, [parachainCurrency, unlockDurations]);

  const evmChainUnlockPeriod = ((): UnlockPeriodParts => {
    if (protocol.type !== 'erc20') {
      return null;
    }

    const unlockTime = new CrossChainTime(
      protocol.timeUnit,
      protocol.stakingUnlockPeriod,
    );

    // TODO: Plurality.
    return [unlockTime.toDays(), 'days' as string] as const;
  })();

  const agnosticUnlockPeriod =
    protocol.type === 'parachain'
      ? parachainUnlockPeriod
      : evmChainUnlockPeriod;

  const value =
    agnosticUnlockPeriod === null ? (
      // Still fetching unlocking period.
      <SkeletonLoader className="max-w-[100px] min-w-4" />
    ) : typeof agnosticUnlockPeriod !== 'string' ? (
      // Unlock period is set, and it is known.
      <div>
        <strong>{agnosticUnlockPeriod[0].toString()}</strong>{' '}
        {agnosticUnlockPeriod[1]}
      </div>
    ) : (
      // Unlocking period is unknown because it is not set
      // onchain (Parachain) or unavailable.
      agnosticUnlockPeriod
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
