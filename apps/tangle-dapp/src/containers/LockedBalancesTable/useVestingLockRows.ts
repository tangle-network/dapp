import { useCallback } from 'react';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useApi from '../../hooks/useApi';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import getBlockDate from '../../utils/getBlockDate';
import calculateTimeRemaining from '../../utils/calculateTimeRemaining';
import { BalanceLockRow } from '.';
import { LockUnlocksAtKind, SubstrateLockId } from '../../constants';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import { sortVestingSchedulesAscending } from '../BalancesTableContainer/LockedBalanceDetails/utils';

const useVestingLockRows = (): BalanceLockRow[] | null => {
  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();

  const { result: currentBlockNumber } = useApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), []),
  );

  const { result: babeExpectedBlockTime } = useApi(
    useCallback((api) => api.consts.babe.expectedBlockTime, []),
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
        schedule.locked.div(schedule.perBlock),
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

      const tooltip = isComplete
        ? undefined
        : `${timeRemaining} remaining. Currently at block #${addCommasToNumber(
            currentBlockNumber.toString(),
          )}, with ${addCommasToNumber(
            endingBlockNumber.sub(currentBlockNumber).toString(),
          )} blocks left until all vested tokens are available to claim.`;

      return {
        index,
        type: SubstrateLockId.VESTING,
        remaining: schedule.locked,
        totalLocked: schedule.locked,
        unlocksAt: endingBlockNumber,
        unlocksAtKind: LockUnlocksAtKind.BLOCK,
        unlocksAtTooltip: tooltip,
        isUnlocked: isComplete,
      } satisfies BalanceLockRow;
    });
};

export default useVestingLockRows;
