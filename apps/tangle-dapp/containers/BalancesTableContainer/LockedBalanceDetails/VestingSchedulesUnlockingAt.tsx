import { formatDecimal } from '@polkadot/util';
import { FC, useCallback } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import usePolkadotApi from '../../../hooks/usePolkadotApi';
import usePolkadotApiRx from '../../../hooks/usePolkadotApiRx';
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

    const progressText = isComplete
      ? 'All of the tokens in this vesting schedule have vested and are now available to claim.'
      : `${timeRemaining} remaining. Currently at block #${formatDecimal(
          currentBlockNumber.toString()
        )}, with ${formatDecimal(
          endingBlockNumber.sub(currentBlockNumber).toString()
        )} blocks left until all vested tokens are available to claim.`;

    return (
      <TextCell
        key={index}
        text={`Block #${formatDecimal(endingBlockNumber.toString())}`}
        status={progressText}
      />
    );
  });
};

export default VestingSchedulesUnlockingAt;
