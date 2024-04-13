import { formatDecimal } from '@polkadot/util';
import { FC, useCallback } from 'react';

import useDemocracy from '../../../data/democracy/useDemocracy';
import useApi from '../../../hooks/useApi';
import useApiRx from '../../../hooks/useApiRx';
import calculateTimeRemaining from '../../../utils/calculateTimeRemaining';
import TextCell from './TextCell';

const DemocracyUnlockingAt: FC = () => {
  const {
    lockedBalance: lockedDemocracyBalance,
    latestReferendum: latestDemocracyReferendum,
  } = useDemocracy();

  const { result: currentBlockNumber } = useApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), [])
  );

  const { result: babeExpectedBlockTime } = useApi(
    useCallback((api) => api.consts.babe.expectedBlockTime, [])
  );

  const isInDemocracy =
    lockedDemocracyBalance !== null && lockedDemocracyBalance.gtn(0);

  const democracyLockEndBlock =
    latestDemocracyReferendum !== null && latestDemocracyReferendum.isOngoing
      ? latestDemocracyReferendum.asOngoing.end
      : null;

  if (!isInDemocracy) {
    return;
  }

  const timeRemaining = calculateTimeRemaining(
    babeExpectedBlockTime,
    currentBlockNumber,
    democracyLockEndBlock
  );

  return (
    <TextCell
      status={
        timeRemaining !== null ? `${timeRemaining} remaining.` : undefined
      }
      text={
        democracyLockEndBlock === null
          ? 'Referendum ended'
          : `Referendum ongoing; ends at block #${formatDecimal(
              democracyLockEndBlock.toString()
            )}`
      }
    />
  );
};

export default DemocracyUnlockingAt;
