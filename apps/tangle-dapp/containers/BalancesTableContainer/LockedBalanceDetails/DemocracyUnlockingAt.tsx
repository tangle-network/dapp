import { formatDecimal } from '@polkadot/util';
import { FC, useCallback } from 'react';

import useDemocracy from '../../../data/democracy/useDemocracy';
import usePolkadotApi from '../../../hooks/usePolkadotApi';
import usePolkadotApiRx from '../../../hooks/usePolkadotApiRx';
import calculateTimeRemaining from '../../../utils/calculateTimeRemaining';
import getBlockDate from '../../../utils/getBlockDate';
import TextCell from './TextCell';

const DemocracyUnlockingAt: FC = () => {
  const {
    lockedBalance: lockedDemocracyBalance,
    latestReferendum: latestDemocracyReferendum,
  } = useDemocracy();

  const { data: currentBlockNumber } = usePolkadotApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), [])
  );

  const { value: babeExpectedBlockTime } = usePolkadotApi(
    useCallback((api) => Promise.resolve(api.consts.babe.expectedBlockTime), [])
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

  const democracyLockEndBlockDate = getBlockDate(
    babeExpectedBlockTime,
    currentBlockNumber,
    democracyLockEndBlock
  );

  const timeRemaining = democracyLockEndBlockDate
    ? calculateTimeRemaining(democracyLockEndBlockDate)
    : null;

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
