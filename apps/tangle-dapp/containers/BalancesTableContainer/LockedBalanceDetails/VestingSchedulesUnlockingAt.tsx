import { formatDecimal } from '@polkadot/util';
import { FC, useCallback } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import useApi from '../../../hooks/useApi';
import useApiRx from '../../../hooks/useApiRx';
import calculateTimeRemaining from '../../../utils/calculateTimeRemaining';
import getBlockDate from '../../../utils/getBlockDate';
import TextCell from './TextCell';
import { sortVestingSchedulesAscending } from './VestingScheduleBalances';

const VestingSchedulesUnlockingAt: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();

  const { result: currentBlockNumber } = useApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), [])
  );

  const { result: babeExpectedBlockTime } = useApi(
    useCallback((api) => api.consts.babe.expectedBlockTime, [])
  );

  if (
    babeExpectedBlockTime === null ||
    currentBlockNumber === null ||
    vestingSchedulesOpt === null ||
    vestingSchedulesOpt.isNone
  ) {
    return null;
  }

  return vestingSchedulesOpt
    .unwrap()
    .toSorted(sortVestingSchedulesAscending)
    .map((schedule, index) => {
      const endingBlockNumber = schedule.startingBlock.add(
        schedule.locked.div(schedule.perBlock)
      );

      const endingBlockDate = getBlockDate(
        babeExpectedBlockTime,
        currentBlockNumber,
        endingBlockNumber
      );

      const timeRemaining = endingBlockDate
        ? calculateTimeRemaining(endingBlockDate)
        : null;

      const isComplete = currentBlockNumber.gte(endingBlockNumber);

      const progressText = isComplete
        ? undefined
        : `${timeRemaining} remaining. Currently at block #${formatDecimal(
            currentBlockNumber.toString()
          )}, with ${formatDecimal(
            endingBlockNumber.sub(currentBlockNumber).toString()
          )} blocks left until all vested tokens are available to claim.`;

      const text = isComplete
        ? 'Fully vested'
        : `Block #${formatDecimal(endingBlockNumber.toString())}`;

      return <TextCell key={index} text={text} status={progressText} />;
    });
};

export default VestingSchedulesUnlockingAt;
