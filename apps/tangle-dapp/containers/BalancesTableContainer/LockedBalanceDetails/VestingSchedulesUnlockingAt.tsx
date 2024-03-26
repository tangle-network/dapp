import { FC, useCallback } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import usePolkadotApi from '../../../hooks/usePolkadotApi';
import usePolkadotApiRx from '../../../hooks/usePolkadotApiRx';
import { formatBnWithCommas } from '../../../utils';
import calculateTimeRemaining from '../../../utils/calculateTimeRemaining';
import TextCell from './TextCell';

const VestingSchedulesUnlockingAt: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();

  const { data: currentBlockNumber } = usePolkadotApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), [])
  );

  const { value: babeExpectedBlockTime } = usePolkadotApi(
    useCallback((api) => Promise.resolve(api.consts.babe.expectedBlockTime), [])
  );

  if (
    babeExpectedBlockTime === null ||
    currentBlockNumber === null ||
    vestingSchedulesOpt === null ||
    vestingSchedulesOpt.isNone
  ) {
    return null;
  }

  return vestingSchedulesOpt.unwrap().map((schedule, index) => {
    const endingBlockNumber = schedule.startingBlock.add(
      schedule.locked.div(schedule.perBlock)
    );

    const timeRemaining = calculateTimeRemaining(
      babeExpectedBlockTime,
      currentBlockNumber,
      endingBlockNumber
    );

    const isComplete = currentBlockNumber.gte(endingBlockNumber);

    const progressText = isComplete ? (
      <>All of your vested tokens are now available to claim. </>
    ) : (
      `${timeRemaining} remaining.`
    );

    return (
      <TextCell
        key={index}
        text={`Block #${formatBnWithCommas(endingBlockNumber)}`}
        status={progressText}
      />
    );
  });
};

export default VestingSchedulesUnlockingAt;
