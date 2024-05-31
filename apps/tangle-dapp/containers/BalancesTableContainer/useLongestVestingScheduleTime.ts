import { formatDecimal } from '@polkadot/util';
import { useCallback } from 'react';

import useVestingInfo from '../../data/vesting/useVestingInfo';
import useApi from '../../hooks/useApi';
import useApiRx from '../../hooks/useApiRx';
import calculateTimeRemaining from '../../utils/calculateTimeRemaining';
import getBlockDate from '../../utils/getBlockDate';
import { sortVestingSchedulesAscending } from './LockedBalanceDetails/VestingScheduleBalances';

const useLongestVestingScheduleTime = () => {
  const { result: babeExpectedBlockTime } = useApi(
    useCallback((api) => api.consts.babe.expectedBlockTime, []),
  );

  const { result: currentBlockNumber } = useApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), []),
  );

  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();

  if (
    babeExpectedBlockTime === null ||
    currentBlockNumber === null ||
    vestingSchedulesOpt === null ||
    vestingSchedulesOpt.isNone
  ) {
    return null;
  }

  const vestingSchedules = vestingSchedulesOpt.unwrap();

  if (vestingSchedules.length === 0) {
    return null;
  }

  const sortedVestingSchedules = vestingSchedules.toSorted(
    sortVestingSchedulesAscending,
  );

  const longestVestingSchedule =
    sortedVestingSchedules[sortedVestingSchedules.length - 1];

  const endingBlockNumber = longestVestingSchedule.startingBlock.add(
    longestVestingSchedule.locked.div(longestVestingSchedule.perBlock),
  );

  const endingBlockDate = getBlockDate(
    babeExpectedBlockTime,
    currentBlockNumber,
    endingBlockNumber,
  );

  const timeRemaining = endingBlockDate
    ? calculateTimeRemaining(endingBlockDate)
    : null;

  const isComplete = currentBlockNumber.gte(endingBlockNumber);

  return isComplete
    ? null
    : `${timeRemaining} remaining until the full amount across all vesting schedules is unlocked. Currently at block #${formatDecimal(
        currentBlockNumber.toString(),
      )}, with ${formatDecimal(
        endingBlockNumber.sub(currentBlockNumber).toString(),
      )} blocks left.`;
};

export default useLongestVestingScheduleTime;
